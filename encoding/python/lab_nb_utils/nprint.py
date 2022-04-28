from IPython.display import Markdown, display


def info(msg):
    display(Markdown(f"**{msg}**"))


def ok(msg):
    display(Markdown(
        f"<pre><font color='green'>{msg}</font></pre>"
    ))
