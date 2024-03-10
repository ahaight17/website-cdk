import { AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from '../utils/constants'
import { DnsRecordsConstruct } from "../dns/dns-records-construct";
import { DnsConstruct } from "../dns/dns-construct";

export class CloudfrontConstruct extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

		const { zone, certificate } = new DnsConstruct(this, "DnsConstruct");
		const originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity");

		const s3Bucket = new Bucket(this, "S3Bucket", {
			bucketName: "alexhaight-website",
			accessControl: BucketAccessControl.PRIVATE,
		});

		s3Bucket.addToResourcePolicy(new PolicyStatement({
			actions: ["s3:GetObject"],
			resources: [s3Bucket.arnForObjects("*")],
			principals: [new CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
		}));

		const distribution = new Distribution(this, "CloudFrontDistribution", {
			defaultBehavior: {
				origin: new S3Origin(s3Bucket, {
					originPath: "/dist"
				}),
				allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
        
			defaultRootObject: "index.html",
			domainNames: DNS_CONSTANTS.domains,
			certificate
		});

		new DnsRecordsConstruct(this, "DnsRecordsConstruct", {
			zone,
			distribution
		})
    }
}