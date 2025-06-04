from jinja2 import Environment, FileSystemLoader
import os
from pathlib import Path
from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    def __init__(self):
        self.template_dir = Path(__file__).parent.parent / "templates"
        self.env = Environment(loader=FileSystemLoader(str(self.template_dir)))
        self.sender_email = os.getenv("MAILERSEND_SENDER_EMAIL")
        self.sender_name = os.getenv("MAILERSEND_SENDER_NAME", "ScoreMVP")
        self.smtp_username = os.getenv("MAILERSEND_SMTP_USERNAME")
        self.smtp_password = os.getenv("MAILERSEND_SMTP_PASSWORD")
        self.smtp_server = os.getenv("MAILERSEND_SMTP_SERVER", "smtp.mailersend.net")
        self.smtp_port = int(os.getenv("MAILERSEND_SMTP_PORT", 587))

    def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        template = self.env.get_template(f"{template_name}.html")
        return template.render(**context)

    def send_password_reset_email(self, email: str, reset_token: str) -> None:
        reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={reset_token}"
        context = {
            "reset_url": reset_url,
            "user_email": email
        }
        html_content = self._render_template("password_reset", context)
        subject = "Recuperação de Senha - ScoreMVP"
        self._send_email(email, subject, html_content)

    def send_notification_email(self, to_email: str, subject: str, body: str):
        self._send_email(to_email, subject, body)

    def _send_email(self, to_email: str, subject: str, html_body: str):
        msg = MIMEMultipart("alternative")
        msg["From"] = self.sender_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.sender_email, to_email, msg.as_string())
        except Exception as e:
            print(f"Erro ao enviar e-mail: {e}")

email_service = EmailService() 