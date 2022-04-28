from IPython.display import Markdown, display


def _build_msg(msg, id=None, label=None, color=None, bold=True):
    out = msg
    if id:
        out += f" <code>{id}</code>"
    if bold:
        out = f"<b>{out}</b>"
    if color:
        out = f"<font color='{color}'>{out}</font>"
    if label:
        out += f"&nbsp;&nbsp;<font color='cadetblue'>[ {label} ]</font>"
    return Markdown(out)


def info(msg, val=None, label=None):
    display(_build_msg(msg, val, label, None, True))


def ok(msg, val=None):
    display(_build_msg(msg, val, None, 'green', True))


def error(msg, val=None):
    display(_build_msg(msg, val, None, 'red', True))


def debug(msg, val=None):
    display(_build_msg(msg, val, None, 'gray', None))


def resource(msg, res):
    id = getattr(res, 'id', None)
    name = getattr(res, 'name', None)

    out = f"{msg} <font color='blue'>{res.__class__.__name__}</font>"
    if name:
        out += " - "

    display(_build_msg(msg=out,
                       id=id,
                       label=name,
                       bold=True))


def section(msg):
    display(HTML("<hr></hr>"))
    display(_build_msg(msg, None, None, 'gray', True))


def subsection(msg):
    display(HTML("<hr style='border-top: dashed 1px lightgray;'></hr>"))
    display(_build_msg(msg, None, None, 'gray', True))
