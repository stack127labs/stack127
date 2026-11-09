# Hosting and deploy apps: discovery list

Checked on 2026-11-04. This is a discovery inventory, not finished product research or a ranking. Prices and feature comparisons come after field approval.

## What counts

Include a named product that serves a public website or app, runs its backend code, or deploys it to a server the builder controls. Include regional services and specialist runtimes. A virtual private server (VPS) is a rented server you maintain. A container packages an app and its dependencies. Serverless means the provider manages the servers and runs your code when needed.

Count each distinct product once. Keep several products from one company when they have different hosting or maintenance models. Do not count plan sizes, operating system images, one-click templates, or old names as separate apps. Keep the primary type below even when the product also fits another type.

- **Active:** an official product page or official documentation was readable and offered a current product. This confirms a public offering, not signup success, capacity, reliability, or a tested deployment.
- **Gray:** the site is readable, but audience fit, product boundaries, access, or a pending change needs an owner decision. The reason says why.
- **Check again:** an official URL was opened, but a block, empty page, or failed fetch prevented a current operating check. These are candidates, not confirmed active services.

The date column is the date of the official-site check. `Attempt only` means existence and operation were not confirmed. Regions describe the market visible on the linked page or its language, not verified company headquarters or a full server-region list. `Not checked` means exactly that.

Discovery codes link to the source register in [notes.md](notes.md): **S1** problem searches; **V1** Railway comparison; **A1** awesome-paas; **A2** static-site lists; **R1** G2; **C1** Rails community; **C2** Next.js community; **E1** European host discovery; **I1** Indian cloud comparison; **L1** Brazil/Argentina discovery; **P1** Virtuozzo provider catalog; **O** seed name followed directly to its official site. O does not imply an independent recommendation. Official links in each row supply the existence evidence. Notes record exceptions and changed names.

## Frontend and static hosting

Static hosting serves prebuilt files. Some products here also run app code.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vercel | https://vercel.com/ | Frontend/static | Not checked | Deploy websites and web apps from code. | V1, S1 | Active | 2026-11-04 |
| Netlify | https://www.netlify.com/ | Frontend/static | Not checked | Hosted website builds, deployments, and functions. | V1, S1 | Active | 2026-11-04 |
| Cloudflare Pages | https://www.cloudflare.com/products/pages/ | Frontend/static | Global network advertised | Hosted static and full-stack sites; keep separate from Workers. | A2, S1 | Active | 2026-11-04 |
| GitHub Pages | https://pages.github.com/ | Frontend/static | Not checked | Publish project websites from Git repositories. | A1, A2 | Active | 2026-11-04 |
| GitLab Pages | https://docs.gitlab.com/user/project/pages/ | Frontend/static | Not checked | Static websites published through GitLab. | O | Active | 2026-11-04 |
| Firebase Hosting | https://firebase.google.com/products/hosting | Frontend/static | Global delivery advertised | Static and single-page hosting; also databases/backend and auth. | S1 | Active | 2026-11-04 |
| Firebase App Hosting | https://firebase.google.com/products/app-hosting | Frontend/static | Not checked | Full-stack hosting distinct from Firebase Hosting; also databases/backend and auth. | O; linked from Firebase Hosting | Active | 2026-11-04 |
| AWS Amplify Hosting | https://aws.amazon.com/amplify/ | Frontend/static | Not checked | Managed frontend and full-stack deployment; also databases/backend and auth. | A2, S1 | Active | 2026-11-04 |
| Azure Static Web Apps | https://azure.microsoft.com/en-us/products/app-service/static | Frontend/static | Not checked | Static sites with integrated backend functions. | S1 | Active | 2026-11-04 |
| Surge | https://surge.sh/ | Frontend/static | Global network advertised | Upload static output from a command line. | A2 | Active | 2026-11-04 |
| Neocities | https://neocities.org/ | Frontend/static | Not checked | Static site hosting for creators; check commercial rules later. | O | Active | 2026-11-04 |
| Codeberg Pages | https://codeberg.page/ | Frontend/static | Not checked | Open-source project sites; gray because eligibility is narrower than general commercial hosting. | O | Gray | 2026-11-04 |
| sourcehut pages | https://srht.site/ | Frontend/static | Not checked | Static publishing attached to sourcehut accounts. | O | Active | 2026-11-04 |
| statichost.eu | https://www.statichost.eu/ | Frontend/static | Europe | European static hosting with a developer workflow. | O | Active | 2026-11-04 |
| Static.app | https://static.app/ | Frontend/static | Not checked | Upload and host website files. | S1 | Active | 2026-11-04 |
| Tiiny Host | https://tiiny.host/ ; https://helpdesk.tiiny.host/en/article/pricing-plans-1i3vkky/ | Frontend/static | Not checked | Simple website-file hosting; official help page readable despite an empty main-page extract. | O | Active | 2026-11-04 |
| Appwrite Sites | https://appwrite.io/products/sites | Frontend/static | Not checked | Git-based static and server-rendered app hosting; also databases/backend and auth. | C2 | Active | 2026-11-04 |
| EdgeOne Makers, formerly EdgeOne Pages | https://pages.edgeone.ai/document/faqs | Frontend/static | Not checked | Tencent's frontend/full-stack deployment product; official FAQ confirms new name. | O; official rename search | Active | 2026-11-04 |
| 4EVERLAND DWeb Hosting | https://www.4everland.org/ | Frontend/static | Not checked | Decentralized website hosting; gray because this is a specialist publishing model. | O | Gray | 2026-11-04 |
| Amazon S3 static website hosting | https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html | Frontend/static | Not checked | Official static website mode; requires extra services for a complete secure delivery setup. | O | Active | 2026-11-04 |
| Azure Storage static website hosting | https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website | Frontend/static | Not checked | Official website mode for Blob Storage, distinct from Static Web Apps. | O | Active | 2026-11-04 |
| IONOS Deploy Now | https://www.ionos.com/hosting/deploy-now | Frontend/static | Not checked | GitHub-based website deployment, including a PHP use case. | O | Active | 2026-11-04 |
| Nekoweb | https://nekoweb.org/ | Frontend/static | Not checked | Creator-oriented static hosting candidate; official fetch returned 403. | Static-hosting community search | Check again | Attempt only: 2026-11-04 |

## Managed app platforms

These run an app for you. Some still expose server settings. Catalog-only hosts are flagged because they may not accept your own app.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Railway | https://railway.com/ | Managed app | Not checked | Deploy apps and databases together; also databases/backend. | V1, A1 | Active | 2026-11-04 |
| Render | https://render.com/ | Managed app | Not checked | Web services, static sites, workers, and databases; also databases/backend. | V1, A1 | Active | 2026-11-04 |
| Fly.io | https://fly.io/ | Managed app | Global placement advertised | App deployment on small virtual machines; also databases/backend. | V1, A1, C1 | Active | 2026-11-04 |
| Heroku | https://www.heroku.com/ | Managed app | Not checked | General app platform; owned by Salesforce, not a duplicate of Salesforce Platform. | V1, A1 | Active | 2026-11-04 |
| DigitalOcean App Platform | https://www.digitalocean.com/products/app-platform | Managed app | Not checked | Managed apps separate from self-managed Droplets. | V1, A1 | Active | 2026-11-04 |
| Koyeb | https://www.koyeb.com/ ; https://www.koyeb.com/blog/koyeb-is-joining-mistral-ai-to-build-the-future-of-ai-infrastructure | Managed app | Not checked | Current hosting offer, but Mistral transition and paid-plan-only new access need review. | A1, R1 | Gray | 2026-11-04 |
| Northflank | https://northflank.com/ | Managed app | Not checked | Hosted apps and own-cloud deployments; also databases/backend. Site carried a security-incident notice. | C1 | Active | 2026-11-04 |
| Zeabur | https://zeabur.com/ | Managed app | Chinese and English markets visible | Deploy and operate app infrastructure; AI Hub shutdown notice concerns a separate feature. | A1 | Active | 2026-11-04 |
| Zerops | https://zerops.io/ ; https://docs.zerops.io/billing/pricing | Managed app | Not checked | App runtimes and databases; official billing docs readable after homepage timeout. | A1 | Active | 2026-11-04 |
| Sevalla | https://sevalla.com/ | Managed app | Not checked | App, static, and database hosting; keep historical Kinsta app-hosting name as an alias. | A1 | Active | 2026-11-04 |
| Scalingo | https://scalingo.com/ | Managed app | Europe | App and database hosting; also databases/backend. | A1 | Active | 2026-11-04 |
| Clever Cloud | https://www.clever.cloud/ | Managed app | Europe | Deploy code to managed application infrastructure; also databases/backend. | A1 | Active | 2026-11-04 |
| Upsun Cloud, formerly Platform.sh | https://upsun.com/ | Managed app | Not checked | Managed application platform; old and new names count once. | A1, R1 | Active | 2026-11-04 |
| PythonAnywhere | https://www.pythonanywhere.com/ | Managed app | Not checked | Managed hosting for Python websites. | O | Active | 2026-11-04 |
| fortrabbit | https://www.fortrabbit.com/ | Managed app | European market visible | Managed PHP app hosting. | A1 | Active | 2026-11-04 |
| Back4app | https://www.back4app.com/ | Managed app | Not checked | Backend app hosting; old Containers URL redirects to a backend-focused site. Recheck general container availability; also databases/backend and auth. | A1, R1 | Gray | 2026-11-04 |
| Replit Publishing | https://replit.com/deployments | Managed app | Not checked | Production publishing attached to a development environment; also databases/backend. | O | Active | 2026-11-04 |
| Elestio | https://elest.io/ | Managed app | Not checked | Managed app catalog and deployment pipelines; distinguish custom code from catalog installs; also databases/backend. | E1, A1 | Active | 2026-11-04 |
| PikaPods | https://www.pikapods.com/ | Managed app | EU and US advertised | Managed open-source app catalog; gray because arbitrary app uploads were not confirmed. | A1 | Gray | 2026-11-04 |
| Laravel Cloud | https://laravel.com/cloud | Managed app | Not checked | Framework-specific managed app hosting. | O | Active | 2026-11-04 |
| Sliplane | https://sliplane.io/ | Managed app | Europe | Hosted app runtime and managed database offer for developers. | A1 | Active | 2026-11-04 |
| Doprax | https://www.doprax.com/ | Managed app | Not checked | App deployment and server provisioning; clarify the maintenance split in later research. | O | Active | 2026-11-04 |
| Diploi | https://diploi.com/ | Managed app | Not checked | Development plus production deployment. | A1 | Active | 2026-11-04 |
| Engine Yard | https://www.engineyard.com/ | Managed app | Not checked | Managed application hosting, including Rails; gray until solo-builder costs and access are checked. | A1, C1 | Gray | 2026-11-04 |
| alwaysdata | https://www.alwaysdata.com/en/ | Managed app | Europe | Developer hosting environment; keep despite shared infrastructure because it targets app hosting. | O | Active | 2026-11-04 |
| EvenNode | https://www.evennode.com/ | Managed app | Not checked | Managed Node.js and Python hosting. | O | Active | 2026-11-04 |
| platformOS | https://www.platformos.com/ | Managed app | Not checked | Hosted app development platform; gray because agency focus and runtime model need a fit check. | A1 | Gray | 2026-11-04 |
| Cloudways Velocity | https://www.cloudways.com/en/velocity.php | Managed app | Not checked | Named Node.js hosting product; separate from Cloudways WordPress hosting. | A1, R1; official product link | Active | 2026-11-04 |
| Hostinger managed Node.js hosting | https://www.hostinger.com/nodejs-hosting | Managed app | Not checked | Managed app hosting distinct from Hostinger VPS. | C2; official product search | Active | 2026-11-04 |
| Cloudtype | https://www.cloudtype.io/ | Managed app | Korea | Korean-language Git and container deployment platform. | O | Active | 2026-11-04 |
| Liara PaaS | https://liara.ir/ | Managed app | Iran | Regional application hosting; also databases/backend and email. Buyer eligibility outside Iran needs research. | O | Active | 2026-11-04 |
| ArvanCloud Cloud Container | https://www.arvancloud.ir/en/products/paas | Managed app | Iran; multilingual site | Regional container hosting. Buyer eligibility and payment access need research. | O | Active | 2026-11-04 |
| CloudJiffy | https://cloudjiffy.com/ | Managed app | India | Developer app platform; catalog confirms regional relevance. | P1 | Active | 2026-11-04 |
| Layershift Enscale | https://www.layershift.com/ | Managed app | UK market visible | Named app-platform offer distinct from its managed VPS. | P1 | Active | 2026-11-04 |
| Elastx app platform | https://elastx.se/ | Managed app | Sweden | Regional cloud; platform appears in official partner catalog. Gray until the current product and solo signup path are checked. | P1 | Gray | 2026-11-04 |
| Ruk-Com Cloud PaaS | https://ruk-com.cloud/ | Managed app | Thailand | Official site offers app deployment and scaling. | P1 | Active | 2026-11-04 |
| SaveInCloud Cloudlets | https://saveincloud.com/pt-BR/ | Managed app | Brazil | Regional app/container platform; current official site found after the older domain blocked access. | P1 | Active | 2026-11-04 |
| Reclaim Cloud | https://reclaim.cloud/ ; https://support.reclaimhosting.com/hc/en-us/categories/360005246314-Reclaim-Cloud | Managed app | Not checked | Container app hosting; official support pages readable after homepage timeout. | P1 | Active | 2026-11-04 |
| Antel Mi Nube | https://minubeantel.uy/ | Managed app | Uruguay, per P1 | Regional platform in official vendor catalog; direct access not confirmed. | P1 | Check again | Attempt only: 2026-11-04 |
| Adaptable | https://adaptable.io/ | Managed app | Not checked | Smaller app-platform candidate; current official site was inaccessible. | O | Check again | Attempt only: 2026-11-04 |
| opeNode | https://www.openode.io/ | Managed app | Not checked | Smaller app-hosting candidate; current official site was inaccessible. | O | Check again | Attempt only: 2026-11-04 |
| serv00 | https://www.serv00.com/ | Managed app | Not checked | Free developer website hosting; gray until current runtime, eligibility, and commercial rules are checked. | O | Gray | 2026-11-04 |
| Aptible | https://www.aptible.com/ | Managed app | Not checked | Application deployment for regulated apps; gray because health-team focus may put it beyond typical solo needs. | A1, R1 | Gray | 2026-11-04 |
| Adios | https://www.adios.dev/ | Managed app | Not checked | Deploy app code from development tools into production hosting. | A1 | Active | 2026-11-04 |
| ApexWeave | https://apexweave.com/ | Managed app | Not checked | Git-based app hosting; trial and free-plan wording needs careful follow-up. | A1 | Active | 2026-11-04 |
| AppLaunch | https://applaunch.org/ | Managed app | Not checked | Managed website and container hosting. | A1 | Active | 2026-11-04 |
| Apply.Build | https://apply.build/ | Managed app | Europe | Git-based managed application hosting. | A1 | Active | 2026-11-04 |
| Cloady | https://cloady.com/ | Managed app | Not checked | Deploy source code, folders, and container images. | A1 | Active | 2026-11-04 |
| DormHost | https://dormhost.dev/ | Managed app | India/student market visible | App hosting aimed at students; gray until commercial eligibility is checked. | A1 | Gray | 2026-11-04 |
| Eurobase Cloud | https://eurobase.dev/ | Managed app | Europe | Managed app hosting with a European location focus. | A1 | Active | 2026-11-04 |
| Granite, formerly NoVPS | https://granite.so/ | Managed app | Not checked | App and database hosting; homepage confirms the old name. Also databases/backend. | A1 | Active | 2026-11-04 |
| InstaPods | https://instapods.com/ | Managed app | Not checked | Deploy code to a hosted app service. | A1 | Active | 2026-11-04 |
| Ownkube | https://ownkube.io/ | Managed app | Not checked | Hosted apps with database and cache; also databases/backend. | A1 | Active | 2026-11-04 |
| Pethost | https://pethost.dev/ | Managed app | Multilingual site | App/container hosting for builders. | A1 | Active | 2026-11-04 |
| SnapDeploy | https://snapdeploy.dev/ | Managed app | Not checked | Managed container app hosting. | A1 | Active | 2026-11-04 |
| Staxa | https://staxa.dev/ | Managed app | Not checked | Separate app environments for each customer; gray for this specialist deployment model. | A1 | Gray | 2026-11-04 |
| xhostd | https://xhostd.com/ | Managed app | Not checked | Hosted apps and backend services; also databases/backend and auth. | A1 | Active | 2026-11-04 |
| Flux Orbit | https://runonflux.com/apps/orbit | Managed app | Decentralized global network | Git-based app deployment; gray for decentralized hosting and payment model. | A1 | Gray | 2026-11-04 |
| lavela | https://lavela.dev/ | Managed app | Not checked | App deployment candidate from the public list; official site inaccessible. | A1 | Check again | Attempt only: 2026-11-04 |
| MoodLensAI hosting | https://moodlensai.com/ | Managed app | Not checked | App hosting candidate from the public list; official site returned a cache miss. | A1 | Check again | Attempt only: 2026-11-04 |
| The Vibe Hosting | https://thevibehosting.com/ | Managed app | Not checked | App/server hosting candidate; official site inaccessible. | A1 | Check again | Attempt only: 2026-11-04 |
| podway | https://podway.io/ | Managed app | Not checked | Managed open-source app catalog candidate; official site inaccessible. | A1 | Check again | Attempt only: 2026-11-04 |

## Cloud and serverless app products

These are specific services, not whole cloud companies. Functions run pieces of backend code. They are not always a complete website host.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cloudflare Workers | https://www.cloudflare.com/products/workers/ | Cloud/serverless | Global network advertised | Run website and app code without maintaining servers. | S1 | Active | 2026-11-04 |
| Deno Deploy | https://deno.com/deploy ; https://deno.com/blog/cloudflare | Cloud/serverless | Not checked | Existing app host, but official October 9 notice says it will close in six months as team joins Cloudflare. Retain as a transition case, not a fresh recommendation. | O; official notice | Gray | 2026-11-04 |
| Fastly Compute | https://www.fastly.com/products/edge-compute | Cloud/serverless | Global network advertised | Run app code near users on an edge network. | O | Active | 2026-11-04 |
| Wasmer Edge | https://wasmer.io/products/edge | Cloud/serverless | Global network advertised | Serverless app hosting using its runtime. | O | Active | 2026-11-04 |
| AWS Lambda | https://aws.amazon.com/lambda/ | Cloud/serverless | Not checked | Host backend code; record HTTP access and dependent service costs separately. | R1 | Active | 2026-11-04 |
| Amazon ECS on AWS Fargate | https://aws.amazon.com/fargate/ | Cloud/serverless | Not checked | Run application containers without maintaining the underlying servers. | A1 | Active | 2026-11-04 |
| Amazon ECS Express Mode | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html | Cloud/serverless | Not checked | Simplified public app deployment on ECS/Fargate. Same product family; compare as a deployment mode, not another independent vendor. | Official App Runner notice | Active | 2026-11-04 |
| AWS Elastic Beanstalk | https://aws.amazon.com/elasticbeanstalk/ | Cloud/serverless | Not checked | App deployment service backed by customer-account resources; maintenance duties need care. | O | Active | 2026-11-04 |
| Google Cloud Run | https://cloud.google.com/run | Cloud/serverless | Not checked | Managed app containers and functions; include former Cloud Functions naming within this product family. | A1 | Active | 2026-11-04 |
| Google App Engine | https://cloud.google.com/appengine | Cloud/serverless | Not checked | Specific managed service for server-rendered apps. | A1 | Active | 2026-11-04 |
| Azure App Service | https://azure.microsoft.com/en-us/products/app-service | Cloud/serverless | Not checked | Managed website and API hosting. | R1 | Active | 2026-11-04 |
| Azure Container Apps | https://azure.microsoft.com/en-us/products/container-apps | Cloud/serverless | Not checked | Managed app containers. | O | Active | 2026-11-04 |
| Azure Functions | https://azure.microsoft.com/en-us/products/functions | Cloud/serverless | Not checked | Backend function hosting. | R1 | Active | 2026-11-04 |
| IBM Cloud Code Engine | https://www.ibm.com/products/code-engine | Cloud/serverless | Not checked | Specific serverless container and code service. | A1 | Active | 2026-11-04 |
| Oracle Cloud Infrastructure Functions | https://www.oracle.com/cloud/cloud-native/functions/ | Cloud/serverless | Not checked | Specific backend function service. | O | Active | 2026-11-04 |
| DigitalOcean Functions | https://www.digitalocean.com/products/functions | Cloud/serverless | Not checked | Backend code hosting distinct from App Platform. | A1 | Active | 2026-11-04 |
| Scaleway Serverless Containers | https://www.scaleway.com/en/serverless-containers/ | Cloud/serverless | Europe | Specific managed container service. | O | Active | 2026-11-04 |
| Alibaba Cloud Function Compute | https://www.alibabacloud.com/en/product/function-compute | Cloud/serverless | Chinese and international markets | Backend function and application code hosting. | O | Active | 2026-11-04 |
| Tencent Cloud Serverless Cloud Function | https://www.tencentcloud.com/products/scf | Cloud/serverless | Chinese and international markets | Specific backend function hosting service. | O | Active | 2026-11-04 |
| bunny.net Magic Containers | https://bunny.net/magic-containers/ | Cloud/serverless | Global network advertised | Deploy app containers across an edge network. | O | Active | 2026-11-04 |
| bunny.net Edge Scripting | https://bunny.net/edge-scripting/ | Cloud/serverless | Global network advertised | Deploy application code to the edge; same parent as Magic Containers. | O | Active | 2026-11-04 |
| Val Town | https://www.val.town/ | Cloud/serverless | Not checked | Deploy websites, HTTP code, and automations to live URLs. | O | Active | 2026-11-04 |
| Modal | https://modal.com/ | Cloud/serverless | Not checked | Python app/backend hosting candidate; gray because main pitch centers on AI workloads. | O | Gray | 2026-11-04 |
| Supabase Edge Functions | https://supabase.com/edge-functions | Cloud/serverless | Global deployment advertised | Hosted backend functions; also databases/backend and auth. | A1; official product page | Active | 2026-11-04 |
| Convex functions | https://www.convex.dev/ | Cloud/serverless | Not checked | Hosted backend code tied to its database; also databases/backend and auth. Gray as a backend-only entry. | O | Gray | 2026-11-04 |
| Neon Compute/functions | https://neon.com/ | Cloud/serverless | Not checked | Site now advertises functions alongside Postgres. Gray until product availability and hosting boundary are checked; also databases/backend and auth. | O | Gray | 2026-11-04 |

## VPS and cloud virtual machines

You normally maintain the operating system and app here. Managed VPS services are labelled in the reason. A readable site does not confirm stock in every region.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hetzner Cloud | https://www.hetzner.com/cloud/ | VPS/VM | Europe; US; Singapore | Self-managed servers with a developer cloud interface. | E1, C1 | Active | 2026-11-04 |
| DigitalOcean Droplets | https://www.digitalocean.com/products/droplets | VPS/VM | Not checked | Self-managed app servers, separate from App Platform. | V1, R1 | Active | 2026-11-04 |
| Vultr Cloud Compute | https://www.vultr.com/products/cloud-compute/ ; https://docs.vultr.com/product-overviews/cloud-compute | VPS/VM | Not checked | Self-managed cloud servers. Official docs readable despite blocked marketing site. | E1, S1 | Active | 2026-11-04 |
| Akamai Cloud Compute, formerly Linode | https://www.akamai.com/products/cpu | VPS/VM | Not checked | Linode product URL now redirects here; count once. | A1 | Active | 2026-11-04 |
| OVHcloud VPS | https://www.ovhcloud.com/en/vps/ | VPS/VM | International site | Fixed-plan virtual servers; public-cloud instances belong to the same provider family. | E1 | Active | 2026-11-04 |
| Scaleway Instances | https://www.scaleway.com/en/virtual-instances/ | VPS/VM | Europe | Specific cloud server product. | E1 | Active | 2026-11-04 |
| UpCloud Cloud Servers | https://upcloud.com/ | VPS/VM | International site | Self-managed cloud servers with direct developer access. | E1 | Active | 2026-11-04 |
| netcup VPS | https://www.netcup.com/en/server/vps | VPS/VM | Europe; international buyers visible | Developer servers, separate from its shared hosting. | E1, C2 | Active | 2026-11-04 |
| Contabo VPS | https://contabo.com/en/vps/ ; https://docs.contabo.com/docs/servers-hosting/vps/ | VPS/VM | Not checked | VPS product; official docs readable despite blocked marketing page. | E1 | Active | 2026-11-04 |
| IONOS VPS | https://www.ionos.com/servers/vps | VPS/VM | International site | Specific self-managed server offer. | E1 | Active | 2026-11-04 |
| Aruba Cloud VPS | https://www.arubacloud.com/ | VPS/VM | Europe | VPS and cloud server offering with app templates. | E1 | Active | 2026-11-04 |
| Exoscale Compute Instances | https://www.exoscale.com/ | VPS/VM | Europe | Developer cloud servers. | E1 | Active | 2026-11-04 |
| Kamatera Cloud Servers | https://www.kamatera.com/ | VPS/VM | International site | Configurable virtual app servers. | E1 | Active | 2026-11-04 |
| Civo Compute | https://www.civo.com/public-cloud/compute | VPS/VM | Not checked | Specific virtual machine product, separate from Kubernetes. | O | Active | 2026-11-04 |
| Hostinger VPS | https://www.hostinger.com/vps-hosting | VPS/VM | International site | Self-managed KVM app servers. | L1, S1 | Active | 2026-11-04 |
| HostHatch cloud compute | https://hosthatch.com/products | VPS/VM | Not checked | Developer VM candidate; official page returned no readable body. | E1 | Check again | Attempt only: 2026-11-04 |
| RamNode Cloud VPS | https://ramnode.com/ | VPS/VM | Not checked | Direct cloud server hosting for apps. | O | Active | 2026-11-04 |
| BuyVM | https://buyvm.net/ | VPS/VM | Not checked | Small virtual server hosting; stock must be checked later. | O | Active | 2026-11-04 |
| RackNerd KVM VPS | https://www.racknerd.com/ | VPS/VM | Not checked | Low-cost app server product, not its reseller hosting. | O | Active | 2026-11-04 |
| InterServer VPS | https://www.interserver.net/vps/ | VPS/VM | Not checked | VPS candidate; official fetch repeatedly returned 403. | O | Check again | Attempt only: 2026-11-04 |
| Time4VPS | https://www.time4vps.com/ | VPS/VM | Europe | Linux virtual servers and managed variants. | E1 | Active | 2026-11-04 |
| Cherry Servers virtual servers | https://www.cherryservers.com/ | VPS/VM | Not checked | Virtual app servers alongside bare-metal products. | E1 | Active | 2026-11-04 |
| VPS.NET | https://www.vps.net/ | VPS/VM | UK and US advertised | Specific VPS service with public plans. | O | Active | 2026-11-04 |
| Clouding | https://clouding.io/ | VPS/VM | Spain | Regional cloud VPS for app hosting. | E1 | Active | 2026-11-04 |
| Utho Cloud Compute | https://utho.com/pricing | VPS/VM | India, per I1 | Indian cloud candidate; official page blocked access. | I1 | Check again | Attempt only: 2026-11-04 |
| E2E Networks CPU Cloud | https://www.e2enetworks.com/ | VPS/VM | India | Regional cloud candidate; homepage now emphasizes GPUs. Gray until the current CPU server offering is confirmed. | I1, R1 | Gray | 2026-11-04 |
| AceCloud Compute | https://acecloud.ai/ | VPS/VM | India | Official compute and VPS products visible alongside GPU products. | I1 | Active | 2026-11-04 |
| Cyfuture Cloud Compute | https://cyfuture.cloud/ | VPS/VM | India | Virtual machines available as a named cloud product. | I1 | Active | 2026-11-04 |
| Leapswitch public cloud | https://www.leapswitch.com/ | VPS/VM | India; US; Europe visible | Regional infrastructure provider; gray until the current small-VM product and self-service path are confirmed. | O | Gray | 2026-11-04 |
| IDCloudHost Cloud VPS | https://idcloudhost.com/ | VPS/VM | Indonesia; Singapore visible | Regional developer cloud servers. | Regional hosting search | Active | 2026-11-04 |
| Biznet GIO cloud compute | https://www.biznetgio.com/ | VPS/VM | Indonesia | Regional cloud for personal websites through larger workloads. | O | Active | 2026-11-04 |
| CloudKilat VPS | https://www.cloudkilat.com/id/ | VPS/VM | Indonesia | Local website and app servers. | O | Active | 2026-11-04 |
| VNG Cloud vServer | https://www.vngcloud.vn/ | VPS/VM | Vietnam | Specific regional virtual server product. | O | Active | 2026-11-04 |
| Magalu Cloud Virtual Machines | https://magalu.cloud/ | VPS/VM | Brazil | Regional cloud with named VM offering. | L1 | Active | 2026-11-04 |
| Locaweb Cloud and VPS | https://www.locaweb.com.br/cloud/ | VPS/VM | Brazil | Direct regional servers. Keep its hourly Cloud and prepaid VPS as subproducts in later research. | L1 | Active | 2026-11-04 |
| DonWeb Cloud Servers | https://donweb.com/ | VPS/VM | Latin America; international storefront | Regional app server offering with deployment templates. | L1 | Active | 2026-11-04 |
| Sakura Cloud | https://cloud.sakura.ad.jp/ | VPS/VM | Japan | Local developer cloud server service. | O | Active | 2026-11-04 |
| ConoHa VPS | https://vps.conoha.jp/ | VPS/VM | Japan | VPS site is operating but says new applications are temporarily suspended. Recheck before presenting as available. | O | Check again | 2026-11-04; new access not confirmed |
| NAVER Cloud Server | https://www.ncloud.com/product/compute/server | VPS/VM | Korea; multilingual site | Specific regional cloud server product. | O | Active | 2026-11-04 |
| Alibaba Cloud ECS | https://www.alibabacloud.com/en/product/ecs | VPS/VM | Chinese and international markets | Specific virtual server service. | O | Active | 2026-11-04 |
| Tencent Cloud Lighthouse | https://www.tencentcloud.com/products/lighthouse | VPS/VM | Chinese and international markets | Simplified app server product for builders. | O | Active | 2026-11-04 |
| Huawei Cloud ECS | https://www.huaweicloud.com/intl/en-us/product/ecs.html | VPS/VM | Asia; multilingual international site | Specific virtual server product. | O | Active | 2026-11-04 |
| Infomaniak Public Cloud | https://www.infomaniak.com/en/hosting/public-cloud | VPS/VM | Switzerland; Europe | Specific cloud infrastructure product. | E1 | Active | 2026-11-04 |
| Amazon Lightsail | https://aws.amazon.com/lightsail/ | VPS/VM | Not checked | Simplified cloud app servers and related products. | S1 | Active | 2026-11-04 |
| Amazon EC2 | https://aws.amazon.com/ec2/ | VPS/VM | Not checked | General virtual servers a solo builder can configure. | C2 | Active | 2026-11-04 |
| Google Compute Engine | https://cloud.google.com/products/compute | VPS/VM | Not checked | Specific self-managed virtual server service. | O | Active | 2026-11-04 |
| Azure Virtual Machines | https://azure.microsoft.com/en-us/products/virtual-machines | VPS/VM | Not checked | Specific self-managed virtual server service. | O | Active | 2026-11-04 |
| Oracle Cloud Infrastructure Compute | https://www.oracle.com/cloud/compute/ | VPS/VM | Not checked | Specific virtual server product, not the whole Oracle cloud. | O | Active | 2026-11-04 |
| TransIP VPS | https://www.transip.eu/vps/ | VPS/VM | Europe | Developer virtual servers with public plans. | E1; VPS comparison search | Active | 2026-11-04 |
| Hostwinds VPS | https://www.hostwinds.com/vps/linux | VPS/VM | Not checked | Managed and unmanaged app server choices. | VPS comparison search | Active | 2026-11-04 |
| Liquid Web VPS | https://www.liquidweb.com/vps-hosting/ | VPS/VM | Not checked | VPS plans including management choices. | VPS comparison search | Active | 2026-11-04 |
| RoseHosting managed Linux VPS | https://www.rosehosting.com/ | VPS/VM | Not checked | Managed Linux server option for builders who need help operating a server. | VPS comparison search | Active | 2026-11-04 |
| ScalaHosting managed cloud | https://www.scalahosting.com/managed-cloud-hosting.html | VPS/VM | Not checked | Managed virtual app servers; do not confuse with its shared hosting. | E1 | Active | 2026-11-04 |
| Atlantic.Net Cloud VPS | https://www.atlantic.net/vps-hosting/ | VPS/VM | Not checked | Specific root-access cloud VPS product. | O | Active | 2026-11-04 |
| SSD Nodes | https://www.ssdnodes.com/ | VPS/VM | International locations advertised | App VPS provider; later research must separate prepaid deals from monthly cost. | O | Active | 2026-11-04 |
| cloudscale.ch | https://www.cloudscale.ch/en | VPS/VM | Switzerland | Developer virtual servers with API access. | E1 | Active | 2026-11-04 |
| LightNode VPS | https://www.lightnode.com/ | VPS/VM | Asia; wider regional locations visible | Regional virtual servers beyond common US/EU choices. | L1 | Active | 2026-11-04 |
| MVPS | https://www.mvps.net/ | VPS/VM | Europe | Public VPS plans and deployment templates. | O | Active | 2026-11-04 |
| GreenCloud VPS | https://greencloudvps.com/ | VPS/VM | International markets | Current VPS product site readable on the bare domain after www access failed. | O | Active | 2026-11-04 |
| SaveInCloud Nuvion | https://saveincloud.com/pt-BR/ | VPS/VM | Brazil | Named virtual-machine product distinct from Cloudlets managed app hosting. | P1; official product navigation | Active | 2026-11-04 |

## Self-hosted deploy tools

These are software you run yourself, not rented hosting. A server, backups, and maintenance can still cost money. Some also sell a hosted dashboard. Command-line deploy tools are marked gray because the owner may want only dashboard apps.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Coolify | https://coolify.io/ | Self-hosted deploy | Runs on your own infrastructure | Deploy apps and databases on your servers; optional hosted dashboard; also databases/backend. | S1, A1 | Active | 2026-11-04 |
| Dokploy | https://dokploy.com/ | Self-hosted deploy | Runs on your own infrastructure | Deploy containers, app source, and databases; optional hosted service; also databases/backend. | O | Active | 2026-11-04 |
| CapRover | https://caprover.com/ | Self-hosted deploy | Runs on your own infrastructure | Deploy apps with a self-hosted control panel. | O | Active | 2026-11-04 |
| Dokku | https://dokku.com/ | Self-hosted deploy | Runs on your own infrastructure | Small server-side app deployment platform. | S1 | Active | 2026-11-04 |
| Kamal | https://kamal-deploy.org/ | Self-hosted deploy | Runs against your own infrastructure | Deploy container apps to rented or owned servers. Gray only for command-line-tool boundary. | C1 | Gray | 2026-11-04 |
| Easypanel | https://easypanel.io/ | Self-hosted deploy | Runs on your own infrastructure | Self-hosted app and service deployment dashboard. | O | Active | 2026-11-04 |
| CloudPanel | https://www.cloudpanel.io/ | Self-hosted deploy | Runs on your own infrastructure | Website and app server panel. | O | Active | 2026-11-04 |
| Hestia Control Panel | https://hestiacp.com/ | Self-hosted deploy | Runs on your own infrastructure | Manage websites and related hosting services yourself. | O | Active | 2026-11-04 |
| aaPanel | https://www.aapanel.com/ | Self-hosted deploy | Runs on your own infrastructure | Website/server administration with app management. | O | Active | 2026-11-04 |
| CyberPanel | https://cyberpanel.net/ | Self-hosted deploy | Runs on your own infrastructure | Website and container management on your server. | O | Active | 2026-11-04 |
| Virtualmin | https://www.virtualmin.com/ | Self-hosted deploy | Runs on your own infrastructure | Manage websites, app containers, and hosting services. | O | Active | 2026-11-04 |
| Plesk | https://www.plesk.com/ | Self-hosted deploy | Runs on your own infrastructure | Commercial web/app server panel. | R1 | Active | 2026-11-04 |
| cPanel | https://www.cpanel.net/ | Self-hosted deploy | Runs on your own infrastructure | Commercial hosting administration panel, usable by a single server owner. | O | Active | 2026-11-04 |
| Portainer | https://www.portainer.io/ | Self-hosted deploy | Runs on your own infrastructure | Container deployment and management; gray because broader infrastructure work may exceed directory scope. | O | Gray | 2026-11-04 |
| Cloudron | https://www.cloudron.io/ | Self-hosted deploy | Runs on your own infrastructure | Managed app lifecycle on your server. Gray because packaged apps differ from arbitrary app deploys. | O | Gray | 2026-11-04 |
| YunoHost | https://yunohost.org/ | Self-hosted deploy | Runs on your own infrastructure | Install and publish apps on your server; gray for catalog-first model. | O | Gray | 2026-11-04 |
| Runtipi | https://runtipi.io/ | Self-hosted deploy | Runs on your own infrastructure | App deployment with documented public exposure; gray because home-server use is its main pitch. | O | Gray | 2026-11-04 |
| Sandstorm | https://sandstorm.org/ | Self-hosted deploy | Runs on your own infrastructure | Packaged web-app hosting; gray for custom-app fit and upkeep check. | O | Gray | 2026-11-04 |
| Tsuru | https://tsuru.io/ | Self-hosted deploy | Runs on your own infrastructure | Open-source application platform; gray until current maintenance and solo setup burden are checked. | O | Gray | 2026-11-04 |
| OpenFaaS | https://www.openfaas.com/ | Self-hosted deploy | Runs on your own infrastructure | Host app functions on your cluster; gray because setup and license fit need checking. | O | Gray | 2026-11-04 |
| SST | https://sst.dev/ | Self-hosted deploy | Your cloud account | Deploy full-stack apps into your cloud account. Gray for command-line-tool boundary. | O | Gray | 2026-11-04 |
| Serverless Framework | https://www.serverless.com/framework | Self-hosted deploy | Your cloud account | Deploy backend functions and related resources. Gray for command-line-tool boundary. | O | Gray | 2026-11-04 |
| Lunni | https://lunni.dev/ | Self-hosted deploy | Runs on your own infrastructure | Deploy Docker app definitions on your own server; later check release activity. | O | Active | 2026-11-04 |
| Piku | https://github.com/piku/piku | Self-hosted deploy | Runs on your own infrastructure | Small Git-push server deployment project; gray until current maintenance is checked. | O | Gray | 2026-11-04 |
| Stormkit | https://www.stormkit.io/ | Self-hosted deploy | Your infrastructure; hosted option visible | Website and app deployment on your infrastructure. | O | Active | 2026-11-04 |
| Patr | https://patr.cloud/ | Self-hosted deploy | Runs on your own infrastructure | Current site describes a self-hosted platform in closed beta. Code is linked, but public availability needs review. | O | Gray | 2026-11-04 |

## Hosted deploy and server managers

These provide a hosted control service. You usually pay the server or cloud bill separately. They are not the same as self-hosted deploy software.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ploi | https://ploi.io/ | Hosted deploy manager | Your server/provider | Server setup and website deployment. | A1 | Active | 2026-11-04 |
| Laravel Forge | https://laravel.com/forge | Hosted deploy manager | Your server/provider | App-server provisioning and deployments; site also advertises Laravel VPS. | O | Active | 2026-11-04 |
| RunCloud | https://runcloud.io/ | Hosted deploy manager | Your server/provider | Hosted server panel for app and website hosting. | O | Active | 2026-11-04 |
| ServerPilot | https://serverpilot.io/ | Hosted deploy manager | Your server/provider | Manage app servers from a hosted dashboard. | O | Active | 2026-11-04 |
| Hatchbox | https://hatchbox.io/ | Hosted deploy manager | Your server/provider | App hosting management on servers you own. | C1 | Active | 2026-11-04 |
| Appliku | https://appliku.com/ | Hosted deploy manager | Your server/provider | Django deployment on a cloud server you choose. | A1 | Active | 2026-11-04 |
| Cleavr | https://cleavr.io/ | Hosted deploy manager | Your server/provider | Provision servers and deploy several app frameworks. | O | Active | 2026-11-04 |
| Cloud 66 | https://www.cloud66.com/ | Hosted deploy manager | Your server/provider | Build and deploy code onto your servers. | A1, C1 | Active | 2026-11-04 |
| Ravion, successor to Flightcontrol | https://www.ravion.com/ ; https://www.ravion.com/company | Hosted deploy manager | Your AWS account | Own-cloud app deployment; count Flightcontrol history under this record. | A1, C1 | Active | 2026-11-04 |
| Convox | https://www.convox.com/pricing ; https://docs.convox.com/cloud | Hosted deploy manager | Your cloud; also hosted cloud offer | Own-cloud deployment plus managed Convox Cloud. Capture modes separately within one product family. | A1 | Active | 2026-11-04 |
| Qovery | https://www.qovery.com/ | Hosted deploy manager | Your cloud/provider | Cloud app operations; gray until solo costs and setup needs are checked. | A1 | Gray | 2026-11-04 |
| Porter | https://www.porter.run/ | Hosted deploy manager | Your cloud/provider | Own-cloud deployment platform; gray until solo costs and current access are checked. | O | Gray | 2026-11-04 |
| DeployHQ | https://www.deployhq.com/ | Hosted deploy manager | Your server; also hosted products | Deploy code to servers; site now also lists managed VPS and static hosting. | A1 | Active | 2026-11-04 |

## Website builders and specialist managed sites: owner decision

These can put a website online. They are not all general code hosts. Keep them gray until the owner decides whether this directory covers them or gives them another home. Prices and resource fields will need different rules if they stay.

| Name | Official URL | Type | Home region or main markets | Why it belongs | How found | Status | Official-site check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Webflow | https://webflow.com/ | Builder/specialist | Not checked | Build and publish hosted sites; code-hosting boundary needs a decision. | O | Gray | 2026-11-04 |
| Framer | https://www.framer.com/ | Builder/specialist | Not checked | Hosted creator and business websites; builder-first model. | O | Gray | 2026-11-04 |
| Carrd | https://carrd.com/ | Builder/specialist | Not checked | Publish one-page project and creator sites. | O | Gray | 2026-11-04 |
| Wix | https://www.wix.com/ | Builder/specialist | Not checked | Hosted websites and app-building tools; builder-first model. | O | Gray | 2026-11-04 |
| Squarespace | https://www.squarespace.com/ | Builder/specialist | Not checked | Hosted creator and business websites. | O | Gray | 2026-11-04 |
| WordPress.com | https://wordpress.com/hosting/ | Builder/specialist | Not checked | Managed WordPress websites; not general app hosting. | O | Gray | 2026-11-04 |
| Ghost(Pro) | https://ghost.org/pricing/ | Builder/specialist | Not checked | Managed publishing sites; also email/newsletters. | O | Gray | 2026-11-04 |
| Kinsta WordPress Hosting | https://kinsta.com/ | Builder/specialist | Not checked | Managed WordPress sites; distinct from Sevalla's app hosting. | R1 | Gray | 2026-11-04 |
| WP Engine | https://wpengine.com/ | Builder/specialist | Not checked | Managed WordPress and headless sites. | O | Gray | 2026-11-04 |
| SiteGround | https://www.siteground.com/ | Builder/specialist | International storefront | Established direct site hosting; gray exception to skipping generic shared hosts. | C2 | Gray | 2026-11-04 |
| DreamHost | https://www.dreamhost.com/ | Builder/specialist | International storefront | Direct website, WordPress, and app hosting; gray because which product belongs needs a decision. | O | Gray | 2026-11-04 |
| CloudCannon | https://cloudcannon.com/ | Builder/specialist | Not checked | Static-site publishing and content editing; gray for CMS versus host boundary. | A2 | Gray | 2026-11-04 |
| Bubble | https://bubble.io/ | Builder/specialist | Not checked | Build and publish hosted apps; proprietary platform model; also databases/backend and auth. | O | Gray | 2026-11-04 |
| Lovable Cloud | https://lovable.dev/cloud | Builder/specialist | Not checked | Hosted builder apps and backend; also databases/backend and auth. | O | Gray | 2026-11-04 |
| Bolt publishing/Cloud | https://bolt.new/ | Builder/specialist | Not checked | Builder with publishing ecosystem; gray until current native hosting and external-host dependencies are confirmed. | O | Gray | 2026-11-04 |
