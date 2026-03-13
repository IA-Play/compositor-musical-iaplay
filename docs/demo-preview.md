# Demo de funcionamento (fallback de ambiente)

Como o ambiente atual bloqueia acesso ao npm registry (`403 Forbidden`), a aplicação Next.js completa não pode ser iniciada aqui.

Para ainda mostrar funcionamento visual imediato, foi adicionado um preview estático executável:

```bash
python3 -m http.server 4173 --directory demo
```

Acesse: `http://127.0.0.1:4173`

> Assim que o acesso ao npm for liberado, execute o fluxo normal em `README.md` para rodar a aplicação completa.
