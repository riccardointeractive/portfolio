import { S3Client } from '@aws-sdk/client-s3'
import { ENV_SERVER } from '@/config/env'

export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${ENV_SERVER.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ENV_SERVER.r2AccessKeyId,
      secretAccessKey: ENV_SERVER.r2SecretAccessKey,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
}

export const R2_BUCKET = ENV_SERVER.r2BucketName
export const R2_PUBLIC_URL = ENV_SERVER.r2PublicUrl
