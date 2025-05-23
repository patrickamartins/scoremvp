from mailersend import emails
from jinja2 import Environment, FileSystemLoader
import os
from pathlib import Path
from typing import Dict, Any

class EmailService:
    def __init__(self):
        self.mailer = emails.NewEmail(os.getenv("MAILERSEND_API_KEY"))
        self.template_dir = Path(__file__).parent.parent / "templates"
        self.env = Environment(loader=FileSystemLoader(str(self.template_dir)))
        self.sender_email = os.getenv("MAILERSEND_SENDER_EMAIL")
        self.sender_name = os.getenv("MAILERSEND_SENDER_NAME", "ScoreMVP")

    def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        template = self.env.get_template(f"{template_name}.html")
        return template.render(**context)

    async def send_password_reset_email(self, email: str, reset_token: str) -> None:
        reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={reset_token}"
        
        context = {
            "reset_url": reset_url,
            "user_email": email
        }

        html_content = self._render_template("password_reset", context)

        mail_body = {
            "sender": {
                "email": self.sender_email,
                "name": self.sender_name
            },
            "to": [
                {
                    "email": email
                }
            ],
            "subject": "Recuperação de Senha - ScoreMVP",
            "html": html_content
        }

        try:
            self.mailer.send(mail_body)
        except Exception as e:
            print(f"Erro ao enviar email: {str(e)}")
            raise

email_service = EmailService() 