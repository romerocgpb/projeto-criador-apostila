fre = async (t="", e, r=`${on}/api`, n, a="", i="", o="") => {
    let l = null;
    const c = o ? {
        ...e,
        captcha_verify_param: o
    } : e
      , u = await fetch(`${r}/chat/completions?${i}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${t}`,
            "Content-Type": "application/json",
            "Accept-Language": wr(Bn) ?? "en-US",
            "X-FE-Version": "prod-fe-1.1.34",
            "X-Signature": a
        },
        body: JSON.stringify(c),
        signal: n.signal
    }).then(async d => {
        if (d.status === 401 && Zo.set(!0),
        !d.ok)
            throw await d.json();
        if (!d.body)
            throw new Error("No response body");
        return d
    }
    ).catch(d => (l = `${(d == null ? void 0 : d.detail) ?? d}`,
    null));

em outro lugar...
const _h = await fre(localStorage.token, {
            stream: ra,
            model: wt.id,
            messages: as,
            signature_prompt: Dn,
            params: {
                ...(fC = i()) == null ? void 0 : fC.params,
                ...s(Pr),
                format: ((hC = i()) == null ? void 0 : hC.requestFormat) ?? void 0,
                keep_alive: ((pC = i()) == null ? void 0 : pC.keepAlive) ?? void 0,
                stop: gh == null ? void 0 : gh.map(Tr => decodeURIComponent(JSON.parse('"' + Tr.replace(/"/g, '\\"') + '"')))
            },
            extra: kr,
            files: ((yn == null ? void 0 : yn.length) ?? 0) > 0 ? yn : void 0,
            mcp_servers: Vn.length > 0 ? Vn : void 0,
            features: {
                image_generation: (vC = (mC = l()) == null ? void 0 : mC.features) != null && vC.enable_image_generation && (((gC = p()) == null ? void 0 : gC.role) === "admin" || (wC = (bC = (_C = p()) == null ? void 0 : _C.permissions) == null ? void 0 : bC.features) != null && wC.image_generation) ? s(We) : !1,
                web_search: !1,
                auto_web_search: Fr,
                preview_mode: u(),
                flags: n(),
                ...g8,
                enable_thinking: s(xt) && !hr
            },
            variables: {
                ...mV((xC = p()) == null ? void 0 : xC.name, (yC = i()) != null && yC.userLocation ? await PM(localStorage.token).catch(Tr => {
                    console.error(Tr)
                }
                ) : void 0)
            },
            session_id: (kC = C()) == null ? void 0 : kC.id,
            chat_id: r(),
            id: ft,
            ...vh[((TC = l()) == null ? void 0 : TC.completion_version) ?? "1"],
            ...!E() && (as.length == 1 || as.length == 2 && ((EC = as.at(0)) == null ? void 0 : EC.role) === "system" && ((CC = as.at(1)) == null ? void 0 : CC.role) === "user") && (s(xe)[0] === wt.id || s(ye) !== void 0) ? {
                background_tasks: {
                    title_generation: ((MC = (SC = i()) == null ? void 0 : SC.title) == null ? void 0 : MC.auto) ?? !0,
                    tags_generation: ((AC = i()) == null ? void 0 : AC.autoTags) ?? !0
                }
            } : {},
            ...ra && (((NC = (IC = (LC = wt.info) == null ? void 0 : LC.meta) == null ? void 0 : IC.capabilities) == null ? void 0 : NC.usage) ?? !1) ? {
                stream_options: {
                    include_usage: !0
                }
            } : {}
        }, mh[((DC = l()) == null ? void 0 : DC.completion_version) ?? "1"], s(Je), id, `${$r}&signature_timestamp=${v8}`, b_)

esse b_ é o captcha_verify_param que vai pra o servidor do z.ai confirmar que é um humano!
E como ele é gerado?

let b_ = "";
        if ((dC = (uC = l()) == null ? void 0 : uC.features) != null && dC.enable_captcha)
            try {
                b_ = await NM()
            } catch (Tr) {
                console.warn("chat captcha verify failed", Tr),
                di.set(!1),
                Bt.error(S("Verification failed, please try again")),
                gr.error = {
                    content: S("Verification failed, please try again")
                },
                gr.done = !0,
                Gr(je, s(je).messages[ft] = gr),
                Gr(je, s(je).currentId = ft),
                window.removeEventListener("beforeunload", qr),
                await dr(),
                Lr();
                return
            }

ENTÃO, a função(que existe neste contexto) NM É A QUE GERA O CAPTCHA VERIFY PARAM!