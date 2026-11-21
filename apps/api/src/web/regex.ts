/**
 * Regex - Administrator Username Pattern.
 *
 * Matches the 3 to 64 character username the mock console accepts for a new
 * administrator, starting with a letter or number.
 *
 * @since 2.2.1
 */
export const administratorUsernamePattern = /^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/;

/**
 * Regex - Base64 Padding Pattern.
 *
 * Matches the trailing padding that Base64URL encoding drops from WebAuthn
 * credential fields.
 *
 * @since 2.2.1
 */
export const base64PaddingPattern = /=+$/;

/**
 * Regex - Content Disposition Filename Pattern.
 *
 * Captures the quoted filename from a download response header, so a saved
 * export keeps the name the server chose.
 *
 * @since 2.2.1
 */
export const contentDispositionFilenamePattern = /filename="([^"]+)"/;

/**
 * Regex - Digit Pattern.
 *
 * Matches one digit when the password meter checks which character groups a
 * password uses.
 *
 * @since 2.2.1
 */
export const digitPattern = /\d/;

/**
 * Regex - Dotted Hostname Pattern.
 *
 * Matches a hostname made only of digits and dots, which marks an IPv4
 * address that passkeys cannot use as a relying party.
 *
 * @since 2.2.1
 */
export const dottedHostnamePattern = /^[\d.]+$/;

/**
 * Regex - IP Address Pattern.
 *
 * Matches a dotted IPv4 address or any value containing a colon, which the
 * mock console treats as an IPv6 address.
 *
 * @since 2.2.1
 */
export const ipAddressPattern = /^(\d{1,3}\.){3}\d{1,3}$|:/;

/**
 * Regex - Lowercase Letter Pattern.
 *
 * Matches one lowercase letter when the password meter checks which character
 * groups a password uses.
 *
 * @since 2.2.1
 */
export const lowercaseLetterPattern = /[a-z]/;

/**
 * Regex - Lowercase Slug Pattern.
 *
 * Matches an identifier that starts with a lowercase letter and continues with
 * lowercase letters, digits, or hyphens.
 *
 * @since 2.2.1
 */
export const lowercaseSlugPattern = /^[a-z][a-z0-9-]*$/;

/**
 * Regex - Non Digit Pattern.
 *
 * Matches one character that is not a digit, so code fields can strip
 * everything except the numbers a person typed or pasted.
 *
 * @since 2.2.1
 */
export const nonDigitPattern = /\D/;

/**
 * Regex - Notification Path Pattern.
 *
 * Captures the notification ID and the optional test suffix from a mock
 * notification route.
 *
 * @since 2.2.1
 */
export const notificationPathPattern = /^\/api\/v1\/notifications\/(ntf-[0-9a-f]{16})(\/test)?$/;

/**
 * Regex - Notification Target ID Pattern.
 *
 * Matches the fixed prefix and hexadecimal body of a notification target ID
 * inside a backup file.
 *
 * @since 2.2.1
 */
export const notificationTargetIdPattern = /^ntf-[0-9a-f]{16}$/;

/**
 * Regex - Separators Pattern.
 *
 * Matches one whitespace character or hyphen, so a typed recovery code can be
 * compared without its grouping.
 *
 * @since 2.2.1
 */
export const separatorsPattern = /[\s-]/;

/**
 * Regex - Sha256 Hash Pattern.
 *
 * Matches a lowercase hexadecimal SHA-256 digest inside a backup file.
 * Anything else is rejected before import.
 *
 * @since 2.2.1
 */
export const sha256HashPattern = /^[0-9a-f]{64}$/;

/**
 * Regex - Symbol Pattern.
 *
 * Matches one character that is neither a letter nor a digit when the password
 * meter checks which character groups a password uses.
 *
 * @since 2.2.1
 */
export const symbolPattern = /[^a-zA-Z\d]/;

/**
 * Regex - Token Path Pattern.
 *
 * Captures the token ID from a mock access token route.
 * Only lowercase letters, digits, and hyphens are accepted.
 *
 * @since 2.2.1
 */
export const tokenPathPattern = /^\/api\/v1\/auth\/tokens\/([a-z0-9-]+)$/;

/**
 * Regex - Totp Code Pattern.
 *
 * Matches the six digit code an authenticator app shows.
 * The mock console checks typed codes against it.
 *
 * @since 2.2.1
 */
export const totpCodePattern = /^[0-9]{6}$/;

/**
 * Regex - Uppercase Letter Pattern.
 *
 * Matches one uppercase letter when the password meter checks which character
 * groups a password uses.
 *
 * @since 2.2.1
 */
export const uppercaseLetterPattern = /[A-Z]/;

/**
 * Regex - Whitespace Pattern.
 *
 * Matches a run of whitespace, so a copied setup key can be compared without
 * the spaces that group it on screen.
 *
 * @since 2.2.1
 */
export const whitespacePattern = /\s+/;

/**
 * Regex - Year Pattern.
 *
 * Matches a four digit year from 1900 to 2099, which the password meter treats
 * as a guessable pattern.
 *
 * @since 2.2.1
 */
export const yearPattern = /(?:19|20)\d\d/;
