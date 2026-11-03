/**
 * Lib - Regex - Text Administrator Username.
 *
 * Matches a compact local console identity without whitespace or control characters.
 * Usernames remain readable in the redacted activity log and browser session view.
 *
 * @since 2.0.0
 */
export const textAdministratorUsername = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Lib - Regex - Text Base64 URL.
 *
 * Accepts the unpadded representation used by WebAuthn credential responses.
 * Request-size limits still provide the upper bound for encoded binary fields.
 *
 * @since 2.0.0
 */
export const textBase64Url = /^[A-Za-z0-9_-]+$/;

/**
 * Lib - Regex - Text Bearer Authorization.
 *
 * Matches a complete Bearer authorization header and captures its credential.
 * Anchoring prevents unrelated authorization schemes or trailing content from passing.
 *
 * @since 2.0.0
 */
export const textBearerAuthorization = /^Bearer +(.+)$/;

/**
 * Lib - Regex - Text Csrf Token.
 *
 * Matches the fixed prefix and Base64URL payload of a browser session's CSRF value.
 * Malformed header or cookie values are rejected before any digest comparison.
 *
 * @since 2.0.0
 */
export const textCsrfToken = /^pfc_[A-Za-z0-9_-]{32}$/;

/**
 * Lib - Regex - Text Encryption Key.
 *
 * Matches the 32-byte hexadecimal key used to encrypt the stored pfSense credential.
 * Fixed-length input prevents accidental use of a password as an encryption key.
 *
 * @since 2.0.0
 */
export const textEncryptionKey = /^[0-9a-fA-F]{64}$/;

/**
 * Lib - Regex - Text Host Header.
 *
 * Matches a hostname or bracketed IPv6 address with an optional port.
 * Anything else in Host or X-Forwarded-Host is ignored when building the own address.
 *
 * @since 2.0.0
 */
export const textHostHeader = /^(\[[0-9A-Fa-f:.]+\]|[A-Za-z0-9.-]+)(:[0-9]{1,5})?$/;

/**
 * Lib - Regex - Text Mac Address Lower.
 *
 * Matches colon-delimited MAC addresses that use lowercase hexadecimal digits.
 * The schema accepts this representation without rewriting the requested address.
 *
 * @since 2.0.0
 */
export const textMacAddressLower = /^([0-9a-f]{2}:){5}([0-9a-f]{2})$/;

/**
 * Lib - Regex - Text Mac Address Upper.
 *
 * Matches colon-delimited MAC addresses that use uppercase hexadecimal digits.
 * The schema accepts this representation without rewriting the requested address.
 *
 * @since 2.0.0
 */
export const textMacAddressUpper = /^([0-9A-F]{2}:){5}([0-9A-F]{2})$/;

/**
 * Lib - Regex - Text Notification Target ID.
 *
 * Matches the identifier of a notification destination in a route path.
 * Identifiers are a fixed prefix and 16 hexadecimal characters.
 *
 * @since 2.0.0
 */
export const textNotificationTargetId = /^ntf-[0-9a-f]{16}$/;

/**
 * Lib - Regex - Text Personal Access Token.
 *
 * Matches the fixed prefix and Base64URL payload emitted by the token generator.
 * A closed shape rejects arbitrary Bearer values before hash comparison.
 *
 * @since 2.0.0
 */
export const textPersonalAccessToken = /^pfa_[A-Za-z0-9_-]{43}$/;

/**
 * Lib - Regex - Text Personal Access Token ID.
 *
 * Matches stable lowercase client identifiers used in the token file and logs.
 * This intentionally excludes spaces and punctuation other than internal hyphens.
 *
 * @since 2.0.0
 */
export const textPersonalAccessTokenId = /^[a-z][a-z0-9-]*$/;

/**
 * Lib - Regex - Text Recovery Code.
 *
 * Matches a normalized single-use recovery code after spaces and dashes are removed.
 * The alphabet omits look-alike characters so codes survive being written down.
 *
 * @since 2.0.0
 */
export const textRecoveryCode = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/;

/**
 * Lib - Regex - Text Session Token.
 *
 * Matches the fixed prefix and Base64URL payload of an opaque browser session cookie.
 * Values with any other shape never reach the session lookup.
 *
 * @since 2.0.0
 */
export const textSessionToken = /^pfs_[A-Za-z0-9_-]{43}$/;

/**
 * Lib - Regex - Text Setup Code.
 *
 * Matches a normalized one-time setup code printed to the container log.
 * Three groups of five characters keep the code easy to read and type.
 *
 * @since 2.0.0
 */
export const textSetupCode = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$/;

/**
 * Lib - Regex - Text Sha256 Hash.
 *
 * Matches the lowercase hexadecimal digest stored instead of a raw client token.
 * Fixed-length values make timing-safe comparisons safe to perform.
 *
 * @since 2.0.0
 */
export const textSha256Hash = /^[0-9a-f]{64}$/;

/**
 * Lib - Regex - Text Totp Code.
 *
 * Matches the six decimal digits emitted by RFC 6238 authenticator applications.
 * The value remains a string so leading zeroes survive validation.
 *
 * @since 2.0.0
 */
export const textTotpCode = /^[0-9]{6}$/;

/**
 * Lib - Regex - Text Whitespace.
 *
 * Matches one or more whitespace characters in command output.
 * Callers use the pattern to normalize documented system-information fields.
 *
 * @since 2.0.0
 */
export const textWhitespace = /\s+/;
