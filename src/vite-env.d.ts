/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_BASE_ID: string
  readonly VITE_AIRTABLE_API_KEY: string
  readonly VITE_AIRTABLE_TABLE_NAME: string
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_TEMPLATE_ID: string
  readonly VITE_EMAILJS_MODULE_TEMPLATE_ID: string
  readonly VITE_EMAILJS_ORIENTATION_TEMPLATE_ID: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}