import * as Yup from 'yup';

// ─── Reusable field schemas ───────────────────────────────────────────────────

const fullName = Yup.string()
  .trim()
  .min(3, 'Full name must be at least 3 characters')
  .max(60, 'Full name is too long')
  .required('Full name is required');

const email = Yup.string()
  .trim()
  .email('Enter a valid email address')
  .required('Email is required');

const phone = Yup.string()
  .trim()
  .matches(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number (10–15 digits)')
  .required('Phone number is required');

const password = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .required('Password is required');

const confirmPassword = Yup.string()
  .oneOf([Yup.ref('password')], 'Passwords do not match')
  .required('Please confirm your password');

const experience = Yup.string().required('Please select years of experience');

const licenseNumber = Yup.string()
  .trim()
  .min(3, 'License number must be at least 3 characters')
  .required('Medical license number is required');

const regNumber = Yup.string()
  .trim()
  .min(3, 'Registration number must be at least 3 characters')
  .required('Registration number is required');

const certNumber = Yup.string()
  .trim()
  .min(3, 'Certification number must be at least 3 characters')
  .required('Certification number is required');

// ─── Role schemas ─────────────────────────────────────────────────────────────

export const doctorSchema = Yup.object({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  licenseNumber,
  specialty: Yup.string().required('Please select a specialty'),
  experience,
});

export const nurseSchema = Yup.object({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  regNumber,
  specialty: Yup.string().required('Please select a nursing specialty'),
  experience,
});

export const otTechSchema = Yup.object({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  certNumber,
  certifyingBody: Yup.string().required('Please select a certifying body'),
  experience,
});

export const housekeepingSchema = Yup.object({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  idProof: Yup.string()
    .trim()
    .matches(/^[0-9 ]{12,14}$/, 'Enter a valid 12-digit Aadhaar number')
    .required('ID proof number is required'),
  workArea: Yup.string().required('Please select a preferred work area'),
  experience,
});

export const adminSchema = Yup.object({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  facilityName: Yup.string()
    .trim()
    .min(3, 'Facility name must be at least 3 characters')
    .required('Hospital / Clinic name is required'),
  facilityType: Yup.string().required('Please select a facility type'),
  city: Yup.string()
    .trim()
    .min(3, 'City must be at least 3 characters')
    .required('City / Location is required'),
});

// ─── Validation helper ────────────────────────────────────────────────────────

/** Validates `data` against `schema`. Returns a flat map of field → first error message. */
export async function validateForm<T extends object>(
  schema: Yup.ObjectSchema<any>,
  data: T,
): Promise<Record<string, string>> {
  try {
    await schema.validate(data, { abortEarly: false, stripUnknown: true });
    return {};
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((e) => {
        if (e.path && !errors[e.path]) errors[e.path] = e.message;
      });
      return errors;
    }
    return {};
  }
}
