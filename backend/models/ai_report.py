from sqlalchemy import String, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from backend.database.session import Base


class AIExecutiveReport(Base):
    __tablename__ = "ai_executive_reports"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    report_title: Mapped[str] = mapped_column(String(255), nullable=False)
    period_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Structured AI Outputs
    executive_summary: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)  # List of strings/objects
    weaknesses: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    recommendations: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    key_findings: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    
    pdf_path: Mapped[str] = mapped_column(Text, nullable=True)
    pptx_path: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
