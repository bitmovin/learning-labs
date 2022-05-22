import string

import IPython.display
from IPython.display import Markdown, display, HTML
from ipywidgets import widgets


class TutorialPrinter:

    def __init__(self, output_type: str = "IPython", level: int = 1):
        self.output_type = output_type
        self.level = level

    def _output(self, msg):
        if self.output_type == "IPython":
            if isinstance(msg, str):
                display(Markdown(msg))
            else:
                display(msg)
        if self.output_type == "print":
            print(msg)
            return msg

    def _build_msg(self, msg, vars: dict = None, codevars: dict = None, highvars: dict = None, color=None, bold=False):
        sts = StringTemplate(msg)
        if vars:
            sts.format(**vars)
        if highvars:
            high_formatted = {k: f"<b>{v}</b>" for k, v in highvars.items()}
            sts.format(**high_formatted)
        if codevars:
            code_formatted = {k: f"<code>{v}</code>" for k, v in codevars.items()}
            sts.format(**code_formatted)

        out = str(sts)

        if bold:
            out = f"<b>{out}</b>"
        if color:
            out = f"<font color='{color}'>{out}</font>"

        return self._output(out)

    def text(self, msg, **kwargs):
        return self._build_msg(msg, color=None, **kwargs)

    def info(self, msg, **kwargs):
        return self._build_msg(msg, color='blue', **kwargs)

    def ok(self, msg, **kwargs):
        return self._build_msg(msg, color='green', **kwargs)

    def error(self, msg, **kwargs):
        return self._build_msg(msg, color='red', **kwargs)

    def warning(self, msg, **kwargs):
        return self._build_msg(msg, color='orange', **kwargs)

    def debug(self, msg, **kwargs):
        return self._build_msg(msg, color='gray', **kwargs)

    def _link(self, url, target="_new", text=None):
        html = f"<a href='{url}' target='{target}'>{text or url}</a>"
        return html

    def link(self, url, target="_new", text=None):
        html = self._link(url, target, text)
        return self._build_msg(html)

    def codeblock(self, payload, color='transparent'):
        html = HTML(f"<pre style='font-size: 85%; background-color: {color}'>{payload}</pre>")
        return self._output(html)

    def section(self, msg):
        if self.output_type == "IPython":
            display(HTML("<hr></hr>"))
        if self.output_type == "print":
            print("================")

        return self._build_msg(msg, color='gray', bold=True)

    def subsection(self, msg):
        if self.output_type == "IPython":
            display(HTML("<hr style='border-top: dashed 1px lightgray;'></hr>"))
        if self.output_type == "print":
            print("------------")

        return self._build_msg(msg, color='gray', bold=True)


class StringTemplate(object):
    class FormatDict(dict):
        def __missing__(self, key):
            return "{" + key + "}"

    def __init__(self, template):
        self.substituted_str = template
        self.formatter = string.Formatter()

    def __repr__(self):
        return self.substituted_str

    def format(self, *args, **kwargs):
        mapping = StringTemplate.FormatDict(*args, **kwargs)
        self.substituted_str = self.formatter.vformat(self.substituted_str, (), mapping)
        return self.__repr__()