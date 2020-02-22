import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

const stackConfig = new pulumi.Config();
const config = {
  // ===== DONT'T TOUCH THIS -> CONFIG REQUIRED BY ng-deploy-it ======
  projectName: stackConfig.get('projectName'),
  distPath: stackConfig.get('distPath')
  // ===== END ======
};
const projectName = config.projectName;

const bucket = new gcp.storage.Bucket(`${projectName}_nestjs`);
const bucketObjectGo = new gcp.storage.BucketObject('zip-archive', {
  bucket: bucket.name,
  source: new pulumi.asset.AssetArchive({
    '.': new pulumi.asset.FileArchive('./functions/dist/main')
  })
});

const cloudFunction = new gcp.cloudfunctions.Function(
  `${projectName}-nest-func`,
  {
    sourceArchiveBucket: bucket.name,
    runtime: 'nodejs10',
    sourceArchiveObject: bucketObjectGo.name,
    entryPoint: 'handler',
    triggerHttp: true,
    availableMemoryMb: 128
  }
);

export const nodeEndpoint = cloudFunction.httpsTriggerUrl;
