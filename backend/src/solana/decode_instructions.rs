//! Decode Anchor instruction payloads (`global:*`).

use borsh::BorshDeserialize;
use borsh_derive::{BorshDeserialize, BorshSerialize};

use crate::solana::discriminators::report_critical_incident_ix;
use crate::solana::SolanaSyncError;

#[derive(BorshDeserialize, BorshSerialize, Debug, Clone, Copy, PartialEq, Eq)]
pub enum CriticalIncidentTypeSchema {
    TempViolation,
    Damage,
    Delay,
    Lost,
    Unauthorized,
    Other,
}

#[derive(BorshDeserialize, BorshSerialize, Debug, Clone, Copy, PartialEq, Eq)]
pub enum OnChainIncidentSeveritySchema {
    High,
    Critical,
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct ReportCriticalIncidentArgs {
    pub incident_type: CriticalIncidentTypeSchema,
    pub severity: OnChainIncidentSeveritySchema,
    pub evidence_hash: [u8; 32],
    pub description: String,
}

#[must_use]
pub fn critical_incident_type_code(t: CriticalIncidentTypeSchema) -> &'static str {
    match t {
        CriticalIncidentTypeSchema::TempViolation => "TempViolation",
        CriticalIncidentTypeSchema::Damage => "Damage",
        CriticalIncidentTypeSchema::Delay => "Delay",
        CriticalIncidentTypeSchema::Lost => "Lost",
        CriticalIncidentTypeSchema::Unauthorized => "Unauthorized",
        CriticalIncidentTypeSchema::Other => "Other",
    }
}

#[must_use]
pub fn on_chain_severity_code(s: OnChainIncidentSeveritySchema) -> &'static str {
    match s {
        OnChainIncidentSeveritySchema::High => "High",
        OnChainIncidentSeveritySchema::Critical => "Critical",
    }
}

/// Instruction data must include the 8-byte Anchor discriminator prefix.
#[must_use]
pub fn decode_report_critical_incident_ix(data: &[u8]) -> Result<ReportCriticalIncidentArgs, SolanaSyncError> {
    let disc = report_critical_incident_ix();
    if data.len() < 8 {
        return Err(SolanaSyncError::MalformedTransaction);
    }
    if data[..8] != disc {
        return Err(SolanaSyncError::WrongInstruction);
    }
    ReportCriticalIncidentArgs::try_from_slice(&data[8..]).map_err(|_| SolanaSyncError::MalformedTransaction)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::solana::discriminators::report_critical_incident_ix;

    #[test]
    fn decode_report_critical_incident_roundtrip() {
        let args = ReportCriticalIncidentArgs {
            incident_type: CriticalIncidentTypeSchema::TempViolation,
            severity: OnChainIncidentSeveritySchema::Critical,
            evidence_hash: [9u8; 32],
            description: "Cold chain breach".into(),
        };
        let mut data = report_critical_incident_ix().to_vec();
        data.extend(borsh::to_vec(&args).expect("serialize"));
        let decoded = decode_report_critical_incident_ix(&data).expect("decode");
        assert_eq!(decoded.incident_type, CriticalIncidentTypeSchema::TempViolation);
        assert_eq!(decoded.severity, OnChainIncidentSeveritySchema::Critical);
        assert_eq!(decoded.evidence_hash, [9u8; 32]);
        assert_eq!(decoded.description, "Cold chain breach");
    }

    #[test]
    fn decode_rejects_wrong_discriminator() {
        let err = decode_report_critical_incident_ix(&[0u8; 16]).unwrap_err();
        assert!(matches!(err, SolanaSyncError::WrongInstruction));
    }
}
