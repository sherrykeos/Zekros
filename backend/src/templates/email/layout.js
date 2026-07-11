import { app } from "../../config/app.config.js";

function emailLayout({
  title,
  heading,
  content,
  buttonText,
  buttonUrl,
  footerText,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>

<body
style="
margin:0;
padding:40px 0;
background:#0b0b0b;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
color:#ffffff;
"
>

<table
width="100%"
cellpadding="0"
cellspacing="0"
role="presentation"
>

<tr>

<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#161616;
border:1px solid #2a2a2a;
border-radius:16px;
padding:48px;
"
>

<tr>

<td>

<h1
style="
margin:0;
font-size:28px;
font-weight:700;
letter-spacing:2px;
text-align:center;
"
>
${app.name}
</h1>

</td>

</tr>

<tr>

<td style="padding-top:40px;">

<h2
style="
margin:0;
font-size:24px;
font-weight:600;
color:white;
"
>
${heading}
</h2>

</td>

</tr>

<tr>

<td
style="
padding-top:20px;
font-size:16px;
line-height:1.8;
color:#b4b4b8;
"
>

${content}

</td>

</tr>

<tr>

<td
align="center"
style="padding-top:40px;"
>

<a
href="${buttonUrl}"
style="
display:inline-block;
padding:14px 32px;
background:#ffffff;
color:#000000;
text-decoration:none;
font-weight:600;
border-radius:10px;
"
>

${buttonText}

</a>

</td>

</tr>

<tr>

<td
style="
padding-top:40px;
font-size:14px;
line-height:1.6;
color:#71717a;
"
>

${footerText}

</td>

</tr>

<tr>

<td
style="
padding-top:40px;
border-top:1px solid #2a2a2a;
font-size:13px;
color:#71717a;
text-align:center;
"
>

© ${new Date().getFullYear()} ${app.name}

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
}

export default emailLayout;
