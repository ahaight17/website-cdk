import { StackProps } from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { ARecord, AaaaRecord, HostedZone, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { DNS_CONSTANTS } from "../utils/constants";

interface DnsConstructProps extends StackProps {
	zone: IHostedZone,
	distribution: Distribution
}

export class DnsRecordsConstruct extends Construct {
	constructor(scope: Construct, id: string, props: DnsConstructProps) {
		super(scope, id);
    
		const { zone, distribution } = props

		DNS_CONSTANTS.domains.forEach((domain: string) => {
			const recordName = domain.split(".")[0]

			new ARecord(this, `CDNARecord${recordName}`, {
				zone,
				target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
				recordName
			});

			new AaaaRecord(this, `CDNAliasRecord${recordName}`, {
				zone,
				target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
				recordName
			});
		})
	}
}