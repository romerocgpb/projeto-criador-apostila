/**
 * DeepSeekHashV1 PoW Solver
 * 
 * Algoritmo descoberto via engenharia reversa do bundle JS do DeepSeek (module 6008 / 38401).
 * Trata-se de Keccak-f[1600] com 23 rounds (standard SHA-3 usa 24 rounds).
 * O loop de permutação faz for(i=1; i<24; i++), pulando o round 0.
 * 
 * Uso:
 *   node deepseek_pow_solver.js <challenge> <salt> <difficulty> <expire_at>
 * 
 * Exemplo:
 *   node deepseek_pow_solver.js "5f101a117bfe..." "5b35932f4364..." 144000 1777050980188
 */

const { Buffer } = require('buffer');

// ==================== KECCAK CORE (23 ROUNDS) ====================

function makeLaneCopy() {
  return (source, from) => (dest, to) => {
    let si = 2 * from, di = 2 * to;
    dest[di] = source[si];
    dest[di + 1] = source[si + 1];
  };
}

const copyLane = makeLaneCopy();
const copyLane2 = makeLaneCopy();
const copyLane3 = makeLaneCopy();

function chiStep({ A, C }) {
  for (let t = 0; t < 25; t += 5) {
    for (let n = 0; n < 5; n++) copyLane(A, t + n)(C, n);
    for (let n = 0; n < 5; n++) {
      let i = (t + n) * 2, o = (n + 1) % 5 * 2, f = (n + 2) % 5 * 2;
      A[i] ^= ~C[o] & C[f];
      A[i + 1] ^= ~C[o + 1] & C[f + 1];
    }
  }
}

// Round constants padrao Keccak RC[0]..RC[23]
const RC = new Uint32Array([
  0,1, 0,32898, 0x80000000,32906, 0x80000000,0x80008000,
  0,32907, 0,0x80000001, 0x80000000,0x80008081, 0x80000000,32777,
  0,138, 0,136, 0,0x80008009, 0,0x8000000a, 0,0x8000808b,
  0x80000000,139, 0x80000000,32905, 0x80000000,32771, 0x80000000,32770,
  0x80000000,128, 0,32778, 0x80000000,0x8000000a, 0x80000000,0x80008081,
  0x80000000,32896, 0,0x80000001, 0x80000000,0x80008008
]);

function iotaStep({ A, I }) {
  let n = 2 * I;
  A[0] ^= RC[n];
  A[1] ^= RC[n + 1];
}

const PIVOT = [10,7,11,17,18,3,5,16,8,21,24,4,15,23,19,13,12,2,20,14,22,9,6,1];
const ROT = [1,3,6,10,15,21,28,36,45,55,2,14,27,41,56,8,25,43,62,18,39,61,20,44];

function piRhoStep({ A, C, W }) {
  let i = 0;
  copyLane2(A, i + 1)(W, i);
  let o = 0, f = 0, u = 0, s = 32;
  for (; i < 24; i++) {
    let lane = PIVOT[i], rot = ROT[i];
    copyLane2(A, lane)(C, 0);
    o = W[0]; f = W[1]; s = 32 - rot;
    W[u = rot < 32 ? 0 : 1] = (o << rot) | (f >>> s);
    W[(u + 1) % 2] = (f << rot) | (o >>> s);
    copyLane2(W, 0)(A, lane);
    copyLane2(C, 0)(W, 0);
  }
}

function thetaStep({ A, C, D, W }) {
  for (let t = 0; t < 5; t++) {
    let n = 2*t, i = (t+5)*2, o = (t+10)*2, f = (t+15)*2, u = (t+20)*2;
    C[n] = A[n]^A[i]^A[o]^A[f]^A[u];
    C[n+1] = A[n+1]^A[i+1]^A[o+1]^A[f+1]^A[u+1];
  }
  for (let t = 0; t < 5; t++) {
    copyLane3(C, (t+1)%5)(W, 0);
    let o = W[0], f = W[1];
    W[0] = (o << 1) | (f >>> 31);
    W[1] = (f << 1) | (o >>> 31);
    D[2*t] = C[((t+4)%5)*2] ^ W[0];
    D[2*t+1] = C[((t+4)%5)*2+1] ^ W[1];
    for (let r = 0; r < 25; r += 5) {
      A[(r+t)*2] ^= D[2*t];
      A[(r+t)*2+1] ^= D[2*t+1];
    }
  }
}

function absorbBytes(msg, state) {
  for (let r = 0; r < msg.length; r += 8) {
    let n = r / 4;
    state[n] ^= msg[r+7]<<24 | msg[r+6]<<16 | msg[r+5]<<8 | msg[r+4];
    state[n+1] ^= msg[r+3]<<24 | msg[r+2]<<16 | msg[r+1]<<8 | msg[r];
  }
}

function squeezeBytes(state, out) {
  for (let r = 0; r < out.length; r += 8) {
    let n = r / 4;
    out[r] = state[n+1]; out[r+1] = state[n+1]>>>8;
    out[r+2] = state[n+1]>>>16; out[r+3] = state[n+1]>>>24;
    out[r+4] = state[n]; out[r+5] = state[n]>>>8;
    out[r+6] = state[n]>>>16; out[r+7] = state[n]>>>24;
  }
}

// *** PERMUTACAO KECCAK-F[1600] COM 23 ROUNDS ***
// Standard: for(i=0; i<24; i++)
// DeepSeek: for(i=1; i<24; i++)  -->  pula round 0, RC[0] nunca usado
function keccak(state) {
  let C = new Uint32Array(10);
  let D = new Uint32Array(10);
  let W = new Uint32Array(2);
  for (let i = 1; i < 24; i++) {
    thetaStep({ A: state, C, D, W });
    piRhoStep({ A: state, C, W });
    chiStep({ A: state, C });
    iotaStep({ A: state, I: i });
  }
}

// ==================== SPONGE + SHA3-256 (MODIFICADO) ====================

class Sponge {
  constructor() {
    this.rate = 136; // 200 - 256/4 bytes
    this.state = new Uint32Array(50);
    this.queue = Buffer.allocUnsafe(this.rate);
    this.queueOffset = 0;
  }

  absorb(data) {
    for (let e = 0; e < data.length; e++) {
      this.queue[this.queueOffset] = data[e];
      this.queueOffset++;
      if (this.queueOffset >= this.rate) {
        absorbBytes(this.queue, this.state);
        keccak(this.state);
        this.queueOffset = 0;
      }
    }
    return this;
  }

  squeeze() {
    let out = Buffer.allocUnsafe(32);
    let q = Buffer.allocUnsafe(this.queue.length);
    this.queue.copy(q);
    let s = new Uint32Array(this.state.length);
    for (let t = 0; t < this.state.length; t++) s[t] = this.state[t];
    // SHA3 padding: 0x06 || 0x00... || 0x80
    q.fill(0, this.queueOffset);
    q[this.queueOffset] |= 6;
    q[this.rate - 1] |= 128;
    absorbBytes(q, s);
    for (let t = 0; t < out.length; t += this.rate) {
      keccak(s);
      squeezeBytes(s, out.slice(t, t + this.rate));
    }
    return out;
  }

  copy() {
    let s = new Sponge();
    s.state.set(this.state.slice());
    this.queue.copy(s.queue);
    s.queueOffset = this.queueOffset;
    return s;
  }
}

class DeepSeekHash {
  constructor() { this._sponge = new Sponge(); }
  update(data) { this._sponge.absorb(Buffer.from(data, 'utf8')); return this; }
  digest(enc) { return this._sponge.squeeze().toString(enc || 'hex'); }
  copy() { let h = new DeepSeekHash(); h._sponge = this._sponge.copy(); return h; }
}

// ==================== PoW SOLVER ====================

function solvePow(challenge, salt, difficulty, expireAt) {
  let prefix = salt + '_' + expireAt + '_';
  let base = new DeepSeekHash().update(prefix);
  for (let i = 0; i < difficulty; i++) {
    if (base.copy().update(String(i)).digest('hex') === challenge) return i;
  }
  return null;
}

function buildPowHeader(challengeData, answer) {
  let obj = {
    algorithm: challengeData.algorithm,
    challenge: challengeData.challenge,
    salt: challengeData.salt,
    answer: answer,
    signature: challengeData.signature,
    target_path: challengeData.target_path
  };
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

// ==================== CLI ====================

if (require.main === module) {
  if (process.argv.length >= 5) {
    // Uso: node deepseek_pow_solver.js <challenge> <salt> <difficulty> <expire_at>
    let challenge = process.argv[2];
    let salt = process.argv[3];
    let difficulty = parseInt(process.argv[4]);
    let expireAt = process.argv[5];

    console.log('[*] DeepSeekHashV1 PoW Solver');
    console.log('[*] Challenge: ' + challenge);
    console.log('[*] Salt: ' + salt);
    console.log('[*] Difficulty: ' + difficulty);
    console.log('[*] ExpireAt: ' + expireAt);
    console.log('[*] Solving...');

    let t0 = Date.now();
    let answer = solvePow(challenge, salt, difficulty, expireAt);
    let elapsed = Date.now() - t0;

    if (answer !== null) {
      console.log('[+] ANSWER: ' + answer);
      console.log('[+] Time: ' + elapsed + 'ms');
    } else {
      console.log('[-] No solution found within difficulty limit.');
    }
  } else {
    console.log('Usage: node deepseek_pow_solver.js <challenge> <salt> <difficulty> <expire_at>');
    console.log('');
    console.log('API:');
    console.log('  solvePow(challenge, salt, difficulty, expireAt)  // returns answer number or null');
    console.log('  buildPowHeader(challengeData, answer)            // returns base64 string for x-ds-pow-response');
    console.log('');
    console.log('Example:');
    console.log('  let answer = solvePow("5f101a...", "5b3593...", 144000, 1777050980188);');
    console.log('  let header = buildPowHeader({ algorithm: "DeepSeekHashV1", challenge: "...", salt: "...", signature: "...", target_path: "/api/v0/chat/completion" }, answer);');
  }
}

module.exports = { solvePow, buildPowHeader, DeepSeekHash };
