export default () => ({
    aws: {
        accessKey: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION,
        s3BucketName: process.env.S3_NAME,
    },
});