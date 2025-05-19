import { StackProps } from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { ARecord, AaaaRecord, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway, CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

interface DnsConstructProps extends StackProps {
	zone: IHostedZone,
	websiteDistribution: Distribution,
	cdnDistribution: Distribution
	api: RestApi
}

export class DnsRecordsConstruct extends Construct {
	constructor(scope: Construct, id: string, props: DnsConstructProps) {
		super(scope, id);
    
		const { zone, websiteDistribution, cdnDistribution, api } = props;

		DNS_CONSTANTS.websiteDomains.forEach((domain: string) => {

			new ARecord(this, `CDNARecord${domain}`, {
				zone,
				target: RecordTarget.fromAlias(new CloudFrontTarget(websiteDistribution)),
				recordName: domain
			});

			new AaaaRecord(this, `CDNAliasRecord${domain}`, {
				zone,
				target: RecordTarget.fromAlias(new CloudFrontTarget(websiteDistribution)),
				recordName: domain
			});
		});

		DNS_CONSTANTS.cdnDomains.forEach((domain: string) => {

			new ARecord(this, `CDNARecord${domain}`, {
				zone,
				target: RecordTarget.fromAlias(new CloudFrontTarget(cdnDistribution)),
				recordName: domain
			});

			new AaaaRecord(this, `CDNAliasRecord${domain}`, {
				zone,
				target: RecordTarget.fromAlias(new CloudFrontTarget(cdnDistribution)),
				recordName: domain
			});
		});

		new ARecord(this, `CDNARecord${DNS_CONSTANTS.apiDomain}`, {
			zone,
			target: RecordTarget.fromAlias(new ApiGateway(api)),
			recordName: DNS_CONSTANTS.apiDomain
		});

		new AaaaRecord(this, `CDNAliasRecord${DNS_CONSTANTS.apiDomain}`, {
			zone,
			target: RecordTarget.fromAlias(new ApiGateway(api)),
			recordName: DNS_CONSTANTS.apiDomain
		});
	}
}