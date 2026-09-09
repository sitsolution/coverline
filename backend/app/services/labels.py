"""Human-readable labels the app would otherwise have to hardcode."""

from app.models.enums import DocumentType, UserRole

ROLE_LABELS = {
    UserRole.doctor: "Doctor",
    UserRole.nurse: "Nurse",
    UserRole.ot_tech: "OT Technician",
    UserRole.housekeeping: "Housekeeping Staff",
    UserRole.facility_admin: "Facility Admin",
    UserRole.super_admin: "Super Admin",
}

#: What the role's single credential is called on its sign-up and profile screen.
CREDENTIAL_LABELS = {
    UserRole.doctor: "Medical License",
    UserRole.nurse: "Nursing Council Reg.",
    UserRole.ot_tech: "OT Cert. No.",
    UserRole.housekeeping: "Employee ID",
}

#: The credential each role must upload before applying for shifts.
REQUIRED_DOCUMENT_TYPES = {
    UserRole.doctor: [DocumentType.medical_license, DocumentType.id_proof],
    UserRole.nurse: [DocumentType.nursing_registration, DocumentType.id_proof],
    UserRole.ot_tech: [DocumentType.ot_certification, DocumentType.id_proof],
    UserRole.housekeeping: [DocumentType.id_proof],
}

DOCUMENT_TYPE_LABELS = {
    DocumentType.medical_license: "Medical License",
    DocumentType.nursing_registration: "Nursing Registration",
    DocumentType.ot_certification: "OT Certification",
    DocumentType.bls_certification: "BLS Certification",
    DocumentType.acls_certification: "ACLS Certification",
    DocumentType.id_proof: "ID Proof",
    DocumentType.educational_certificate: "Educational Certificates",
    DocumentType.other: "Other Documents",
}

#: Document types where a number and an expiry date are meaningful.
DOCUMENT_TYPES_WITH_NUMBER = {
    DocumentType.medical_license,
    DocumentType.nursing_registration,
    DocumentType.ot_certification,
    DocumentType.id_proof,
}

DOCUMENT_TYPES_WITH_EXPIRY = {
    DocumentType.medical_license,
    DocumentType.nursing_registration,
    DocumentType.ot_certification,
    DocumentType.bls_certification,
    DocumentType.acls_certification,
}

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def credential_label(role: UserRole) -> str:
    return CREDENTIAL_LABELS.get(role, "Credential")


def role_label(role: UserRole) -> str:
    return ROLE_LABELS.get(role, role.value)
