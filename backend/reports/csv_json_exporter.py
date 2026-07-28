import os
import json
import csv
import logging
from typing import Dict, Any, List

logger = logging.getLogger("radar.reports.exporter")


class CSVJSONExporter:
    """
    Exports structured metrics and AI analysis into JSON and CSV formats.
    """

    @staticmethod
    def export_json(output_path: str, data: Dict[str, Any]) -> str:
        """Export dictionary to JSON file."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"JSON export completed at {output_path}")
        return output_path

    @staticmethod
    def export_csv(output_path: str, rows: List[Dict[str, Any]], fieldnames: List[str] = None) -> str:
        """Export list of dictionaries to CSV file."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        if not rows:
            return output_path

        keys = fieldnames or list(rows[0].keys())
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            for r in rows:
                writer.writerow({k: r.get(k, "") for k in keys})
        logger.info(f"CSV export completed at {output_path}")
        return output_path
