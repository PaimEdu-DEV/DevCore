// Código Python que roda dentro do Pyodide: executa o código do jogador num namespace limpo,
// chama a função para cada teste e devolve tudo como JSON (stdout, stderr, erros com linha).
export const PY_HARNESS = String.raw`
import json, sys, io, copy, traceback, math

def __devcore_input(*args, **kwargs):
    raise RuntimeError("input() não funciona aqui: os valores chegam pelos parâmetros da função.")

def __devcore_jsonable(v, depth=0):
    if depth > 50:
        return "<profundo demais>"
    if v is None or isinstance(v, (bool, int, str)):
        return v
    if isinstance(v, float):
        if math.isnan(v): return "nan"
        if math.isinf(v): return "inf" if v > 0 else "-inf"
        return v
    if isinstance(v, (list, tuple)):
        return [__devcore_jsonable(x, depth + 1) for x in v]
    if isinstance(v, (set, frozenset)):
        items = [__devcore_jsonable(x, depth + 1) for x in v]
        try:
            return sorted(items)
        except Exception:
            return items
    if isinstance(v, dict):
        return {str(k): __devcore_jsonable(x, depth + 1) for k, x in v.items()}
    if callable(v):
        return "<função>"
    return repr(v)

def __devcore_tb(e):
    lines = ["Traceback (most recent call last):"]
    line = None
    for fr in traceback.extract_tb(e.__traceback__):
        if fr.filename == "main.py":
            line = fr.lineno
            lines.append('  File "main.py", line %d, in %s' % (fr.lineno, fr.name))
            if fr.line:
                lines.append("    " + fr.line.strip())
    if isinstance(e, SyntaxError):
        line = e.lineno
        lines = ['  File "main.py", line %s' % e.lineno]
        if e.text:
            lines.append("    " + e.text.rstrip("\n").strip())
            if e.offset:
                indent = len(e.text) - len(e.text.lstrip())
                lines.append("    " + " " * max(0, e.offset - 1 - indent) + "^")
        msg = e.msg
    else:
        msg = str(e)
        if isinstance(e, KeyError) and len(e.args) == 1:
            msg = repr(e.args[0])
    lines.append("%s: %s" % (type(e).__name__, msg))
    return {"type": type(e).__name__, "message": msg, "line": line}, "\n".join(lines) + "\n"

def __devcore_run(code, fn_name, tests_json):
    out, err = io.StringIO(), io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = out, err
    result = {"outcomes": []}
    ns = {"__name__": "__main__", "input": __devcore_input}
    try:
        try:
            exec(compile(code, "main.py", "exec"), ns)
        except BaseException as e:
            info, tb = __devcore_tb(e)
            result["error"] = info
            err.write(tb)
        else:
            fn = ns.get(fn_name)
            if not callable(fn):
                result["error"] = {"type": "FunctionNotFound", "message": "A função %s não foi encontrada no seu código." % fn_name, "line": None}
            else:
                for t in json.loads(tests_json):
                    try:
                        v = fn(*copy.deepcopy(t["args"]))
                        result["outcomes"].append({"ok": True, "value": __devcore_jsonable(v)})
                    except BaseException as e:
                        info, tb = __devcore_tb(e)
                        result["outcomes"].append({"ok": False, "error": info})
                        if len(err.getvalue()) < 4000:
                            err.write(tb)
    finally:
        sys.stdout, sys.stderr = old_out, old_err
    result["stdout"] = out.getvalue()[:20000]
    result["stderr"] = err.getvalue()[:20000]
    return json.dumps(result)
`;
