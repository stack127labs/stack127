# Ad network niche rubric

Use one niche for each confirmed site. Judge the site's main subject from its title, description, H1, homepage navigation and recent content. The domain can help, but do not label from the name alone. Platform is context, not a niche.

## The 20 niches

food: Recipe, cooking, baking and drink sites.
home-diy: Home decor, cleaning, repairs, renovation and home projects.
travel: Destination guides, itineraries, trip planning and travel advice.
parenting: Pregnancy, babies, child care, kids and family life.
personal-finance: Personal or household money, saving, budgets, debt, credit, investing and side income.
health-fitness: Health, wellness, exercise, workouts and fitness advice.
beauty-fashion: Makeup, skin care, hair, clothing and personal style.
gaming: Video games, tabletop games, online puzzle and brain games, game guides, wikis, reviews and news for players.
tech: Software, devices, web tools and utilities, technology how-to guides and tech reviews.
crafts: Sewing, knitting, crochet, paper crafts, patterns and other making hobbies.
pets: Dogs, cats and other companion animals.
outdoors: Camping, hiking, hunting, fishing and outdoor gear or skills.
gardening: Plants, growing food, lawns, gardens and yard care.
sports: Teams, leagues, scores, sports news and fantasy sports.
entertainment: TV, movies, music, books and celebrities.
lifestyle: General life, relationships and personal blogs with no stronger niche.
education: Learning, school help, languages and reference material.
automotive: Cars, trucks, motorcycles, repairs and vehicle buying guides.
business: Companies, startups, marketing, work and careers.
news: General current events and reporting across topics.

## Tie-breaks

- Choose the subject that dominates the homepage and navigation. A specialist topic beats a broad one.
- A recipe-first site stays food when it also has travel posts. Choose travel when destinations and trip guides lead, even if food is part of the trip.
- Game news, reviews and guides are gaming. General current events are news. A general news site does not become gaming because it has a games section.
- Personal money for individuals or households is personal-finance. Company, startup, industry, marketing and career coverage is business. Market and economy news is business, or news when it sits among general headlines.
- A free web tool or utility (converters, weather, speed tests) is tech. A company selling marketing, advertising or other services to businesses is business.
- House projects and repairs are home-diy. Sewing, crochet, patterns and hobby making are crafts. Growing plants is gardening.
- Trips and destinations are travel. Outdoor activities, skills and gear are outdoors.
- Use lifestyle only when the site is broad and no specific niche leads. Do not use it to avoid choosing a clear topic. Events, festivals and culture listings are entertainment. Course, lesson and study material is education.
- Apply the same niches to non-English sites. Use the language and content as evidence. Language alone is never a reason for null.
- Platform does not decide the niche. For example, WordPress can host any topic.
- Return null for parked, for-sale, empty, default, placeholder or closed pages, and pages with no usable topic evidence. Do not guess from a domain name. Use low confidence for null.

## Confidence

- high: Several homepage signals point to one clear subject.
- medium: The site covers mixed subjects, but its main subject still leads.
- low: The available evidence is thin or the subject is uncertain. If there is no meaningful content, return null.

Low confidence suggestions remain local and are not published as a site's niche. The importer writes null for low confidence labels, while retaining the suggestion for later review. Legacy numeric confidence values below 0.8 are withheld too; this is an import threshold, not a measured accuracy rate.

## Output

Write exactly one JSON object per input domain, one per line. Use only a listed niche slug or null. Do not add comments, markdown or extra fields.

{"domain":"...","niche":"food"|null,"confidence":"high"|"medium"|"low"}

The vertical bars mark choices in the schema. Emit one normal JSON value for each field, not a bar-separated string.

The examples below are confirmed domains in the SQLite database. Their homepages were checked on 2026-10-16.

| Domain | JSONL output | Homepage evidence |
| --- | --- | --- |
| [100daysofrealfood.com](https://www.100daysofrealfood.com/) | {"domain":"100daysofrealfood.com","niche":"food","confidence":"high"} | Recipes, meal plans and real-food advice lead. |
| [cookieandkate.com](https://cookieandkate.com/) | {"domain":"cookieandkate.com","niche":"food","confidence":"high"} | Vegetarian recipe blog. |
| [anikasdiylife.com](https://www.anikasdiylife.com/) | {"domain":"anikasdiylife.com","niche":"home-diy","confidence":"high"} | Woodworking, home improvement and decor projects. |
| [allcrafts.life](https://allcrafts.life/) | {"domain":"allcrafts.life","niche":"crafts","confidence":"high"} | Crochet and amigurumi patterns lead. |
| [10gardentips.com](https://www.10gardentips.com/) | {"domain":"10gardentips.com","niche":"gardening","confidence":"high"} | Gardening headlines and growing advice dominate. |
| [nomadicmatt.com](https://www.nomadicmatt.com/) | {"domain":"nomadicmatt.com","niche":"travel","confidence":"high"} | Destinations and budget travel advice lead. |
| [adventurehiketravel.com](https://www.adventurehiketravel.com/) | {"domain":"adventurehiketravel.com","niche":"outdoors","confidence":"high"} | Hiking, outdoor activities and gear reviews lead. |
| [2foodtrippers.com](https://www.2foodtrippers.com/) | {"domain":"2foodtrippers.com","niche":"travel","confidence":"medium"} | Mixed food and travel blog; destination food guides lead. |
| [theeverymom.com](https://theeverymom.com/) | {"domain":"theeverymom.com","niche":"parenting","confidence":"high"} | Motherhood, pregnancy and parenting guide the site. |
| [abcmoney.blog](https://abcmoney.blog/) | {"domain":"abcmoney.blog","niche":"personal-finance","confidence":"high"} | Money tips and insurance topics lead. |
| [agapeinvests.com](https://agapeinvests.com/) | {"domain":"agapeinvests.com","niche":"personal-finance","confidence":"high"} | Teaches personal money management. |
| [acgfitness.com](https://acgfitness.com/) | {"domain":"acgfitness.com","niche":"health-fitness","confidence":"high"} | Fitness and getting stronger lead. |
| [15minutebeauty.com](https://www.15minutebeauty.com/) | {"domain":"15minutebeauty.com","niche":"beauty-fashion","confidence":"high"} | Skin care, makeup, hair and beauty advice. |
| [1001games.com](https://www.1001games.com/) | {"domain":"1001games.com","niche":"gaming","confidence":"high"} | Free online games and game categories. |
| [techraptor.net](https://techraptor.net/) | {"domain":"techraptor.net","niche":"gaming","confidence":"high"} | Gaming news, reviews and guides, despite “Tech” in its name. |
| [androidauthority.com](https://www.androidauthority.com/) | {"domain":"androidauthority.com","niche":"tech","confidence":"high"} | Android devices, software, news and reviews. |
| [101dogbreeds.com](https://www.101dogbreeds.com/) | {"domain":"101dogbreeds.com","niche":"pets","confidence":"high"} | Dog breeds, facts and care information. |
| [433football.com](https://www.433football.com/) | {"domain":"433football.com","niche":"sports","confidence":"high"} | Football community and coverage. |
| [tvline.com](https://www.tvline.com/) | {"domain":"tvline.com","niche":"entertainment","confidence":"high"} | TV news, casting, spoilers and reviews. |
| [alleydog.com](https://alleydog.com/) | {"domain":"alleydog.com","niche":"education","confidence":"high"} | Psychology definitions, class notes and student help. |
| [99percentlifestyle.com](https://99percentlifestyle.com/) | {"domain":"99percentlifestyle.com","niche":"lifestyle","confidence":"medium"} | Broad magazine about people, places and culture. |
| [aa1car.com](https://aa1car.com/) | {"domain":"aa1car.com","niche":"automotive","confidence":"high"} | Car diagnosis, repair and maintenance. |
| [km77.com](https://www.km77.com/) | {"domain":"km77.com","niche":"automotive","confidence":"high"} | Spanish-language car news, tests and technical articles. |
| [247careers.co.za](https://www.247careers.co.za/) | {"domain":"247careers.co.za","niche":"business","confidence":"high"} | Job updates and career application tips. |
| [apnews.com](https://apnews.com/) | {"domain":"apnews.com","niche":"news","confidence":"high"} | General headlines and breaking news. |
