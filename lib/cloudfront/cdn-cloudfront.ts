import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Distribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";

interface CdnCloudfrontProps {
    certificate: ICertificate,
    lambdaFunction: IFunction
}

export class CdnCloudfront extends Construct {
	public cdnDistribution: Distribution;

	constructor(scope: Construct, id: string, props: CdnCloudfrontProps) {
		super(scope, id);

		const { lambdaFunction, certificate } = props;
		const originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity");

		const websiteImagesBucket = new Bucket(this, "WebsiteImagesBucket", {
			bucketName: "alexhaight-website-images",
			accessControl: BucketAccessControl.PRIVATE,
		});

		this.cdnDistribution = new Distribution(this, "CDNCloudFrontDistribution", {
			defaultBehavior: {
				origin: new S3Origin(websiteImagesBucket, {
					originAccessIdentity
				}),
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
			domainNames: DNS_CONSTANTS.cdnDomains,
			certificate
		});
        
		websiteImagesBucket.grantRead(originAccessIdentity);
		websiteImagesBucket.grantReadWrite(lambdaFunction);
	}
}