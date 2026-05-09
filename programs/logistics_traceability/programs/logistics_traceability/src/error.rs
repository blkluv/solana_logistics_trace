use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Name must be non-empty and at most 256 bytes")]
    InvalidActorName,
    #[msg("Location string exceeds 256 bytes")]
    LocationTooLong,
    #[msg("Invalid recipient pubkey")]
    InvalidRecipient,
    #[msg("String exceeds maximum length for this field")]
    StringTooLong,
    #[msg("Checkpoint metadata exceeds 512 bytes")]
    MetadataTooLong,
}
