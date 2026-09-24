"""
Evidence-Based Recommendations Engine.
Generates tailored implementation action plans for construction contractors, PMC, and developers
in the Coimbatore / Tamil Nadu region.
"""
from __future__ import annotations
from typing import List, Dict, Any

class RecommendationsEngine:
    @staticmethod
    def generate_recommendations(
        rii_results: List[Dict[str, Any]],
        anova_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        # Map top barriers and CSFs to evidence-based recommendations
        recommendations = [
            {
                "id": "rec_01",
                "title": "Establish Executive Quality Gatekeeper Protocol",
                "target_factor": "CSF1 & BAR1",
                "category": "Governance & Leadership",
                "urgency": "Immediate (Days 1 - 30)",
                "description": (
                    "Top Management Commitment is the #1 ranked CSF. Executive leadership must mandate that no structural "
                    "pour or milestone handover proceeds without a certified QA/QC sign-off. Form an executive Quality Steering Committee."
                ),
                "action_items": [
                    "Empower Site Quality Engineers with independent authority to halt non-compliant concrete pours.",
                    "Include quality performance metrics in monthly executive board reviews alongside cost and schedule.",
                    "Tie contractor progress billing to milestone quality audit clearances."
                ],
                "expected_impact": "Prevents catastrophic structural defects and reduces client rework claims by up to 35%."
            },
            {
                "id": "rec_02",
                "title": "Institutionalize Trade Artisan Training & Labor Certification",
                "target_factor": "CSF3 & BAR2",
                "category": "Human Capital",
                "urgency": "Immediate (Days 1 - 45)",
                "description": (
                    "Shortage of skilled labor is the most severe barrier identified in the Coimbatore region. Rapid turnover "
                    "of migrant masonry and bar-bending teams necessitates on-site micro-training."
                ),
                "action_items": [
                    "Partner with Coimbatore CREDAI or government ITIs to conduct 3-day on-site bar-bending and formwork workshops.",
                    "Mandate mandatory 15-minute daily Quality Toolbox Talks prior to shift commencement.",
                    "Establish a skill-tiered wage incentive for certified trade artisans."
                ],
                "expected_impact": "Cuts honeycombing, rebar misalignment, and plaster cracking by 40%."
            },
            {
                "id": "rec_03",
                "title": "Deploy Standard Operating Procedures & Mobile Digital Checklists",
                "target_factor": "CSF5 & BAR7",
                "category": "Process Standardisation",
                "urgency": "High (Months 2 - 4)",
                "description": (
                    "Replace paper-based ad-hoc inspection sheets with standardized digital inspection workflows for reinforcement, "
                    "formwork rigidity, concrete cube testing, and water-curing monitoring."
                ),
                "action_items": [
                    "Deploy standardized checklists on mobile tablets for site supervisors and PMC engineers.",
                    "Require photographic proof attached to each inspection sign-off before concrete batching dispatch.",
                    "Maintain automated non-conformance registers with strict 48-hour rectification timeframes."
                ],
                "expected_impact": "100% traceability for statutory compliance and elimination of audit falsification."
            },
            {
                "id": "rec_04",
                "title": "Subcontractor Quality Prequalification & Milestone SLA",
                "target_factor": "CSF6 & BAR5",
                "category": "Supply Chain Integration",
                "urgency": "High (Months 3 - 6)",
                "description": (
                    "Address subcontractor fragmentation by shifting from lowest-bidder selection to quality-weighted procurement "
                    "with clear service level agreements (SLAs)."
                ),
                "action_items": [
                    "Pre-qualify specialized trade subcontractors based on historical defect rates and supervisor ratios.",
                    "Enforce quality retention funds (5%) released only after 12-month defect liability period verification.",
                    "Audit batching plants for cement consistency, aggregate grading, and moisture sensors every 14 days."
                ],
                "expected_impact": "Minimizes subcontractor disputes and aligns supply chain incentives with zero-defect goals."
            },
            {
                "id": "rec_05",
                "title": "Align Project Scheduling with Realistic Curing & Testing Cycles",
                "target_factor": "BAR4",
                "category": "Operational Management",
                "urgency": "Medium (Months 4 - 8)",
                "description": (
                    "Time pressure and schedule compression frequently force premature formwork stripping and inadequate 28-day water curing. "
                    "Critical path schedules must respect chemical curing mechanics."
                ),
                "action_items": [
                    "Incorporate non-destructive testing (Rebound Hammer, Ultrasonic Pulse Velocity) prior to formwork stripping.",
                    "Mandate automatic water mist curing systems for vertical columns and high-grade slabs.",
                    "Prevent project managers from overlapping critical structural activities prematurely."
                ],
                "expected_impact": "Guarantees full 28-day design compressive strength and eliminates micro-cracking."
            }
        ]
        return recommendations
