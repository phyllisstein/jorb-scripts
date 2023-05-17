import cheerio from 'cheerio'

/**
 * Grab the JSON-LD schema from the job listing page. Every site but
 * SmartRecruiters embeds a script tag with its structured Schema.org metadata.
 *
 * @param {string} link - The link to the job listing, extracted from the search
 *                        results
 */
async function getLDSchema(link) {
  // const res = UrlFetchApp.fetch(link)
  const rawRes = await fetch(link)
  const res = await rawRes.text()
  const markup = res.getContentText()
  const $ = cheerio.load(markup)

  return JSON.parse(
    $('script[type="application/ld+json"]').text(),
  )
}

/**
 * Lowest common denominator schema for all job listings. Sample schemas are in
 * this repo's `schemas` directory. The level of detail varies by site, but the
 * following fields are always present:
 *
 *   - title
 *   - description
 *   - datePosted
 *   - hiringOrganization (object with `name` key for all but Jobvite, which is a string)
 *   - jobLocation (object with `addressLocality` and `addressRegion` keys)
 *   - employmentType (except for Greenhouse)
 *
 * Some schemas are much richer than others. In keeping with my "can't someone
 * else do it" ethos, I'm not bothering with anything but the basics here.
 *
 * @param {string} rawJSON - The raw JSON from the job listing page
 */
function parseJobSchema(rawJSON) {
  const {
    title,
    description,
    datePosted,
    hiringOrganization,
    jobLocation,
    employmentType,
  } = rawJSON

  return {
    title,
    description,
    datePosted,
    hiringOrganization: typeof hiringOrganization === 'string' ? hiringOrganization : hiringOrganization.name,
    jobLocation: `${jobLocation.addressLocality}, ${jobLocation.addressRegion}`,
    employmentType,
  }
}

async function searchJobs() {
  const key = ''
  const cx = ''

  // site:
  const sites = [
    'boards.greenhouse.io',
    'jobs.lever.co',
    // 'jobs.smartrecruiters.com',
    'apply.workable.com',
    'jobs.jobvite.com',
  ]

  // excludeTerms
  const excludeTerms = [
    'basis',
    'c#',
  ]

  // hq
  const requiredTerms = [
    'java',
    'ruby',
  ]

  // q (throwaway)
  const q = 'job'

  const sitesParam = sites.map(v=>`site:${v}`).join(' ')
  const requiredTermsParam = requiredTerms.join(' ')
  const excludeTermsParam = excludeTerms.join(' ')

  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${cx}&q=${encodeURIComponent(q)}&orTerms=${encodeURIComponent(sitesParam)}&excludeTerms=${encodeURIComponent(excludeTermsParam)}&hq=${encodeURIComponent(requiredTermsParam)}&dateRestrict=d1`

  // const response = JSON.parse(
  //   UrlFetchApp.fetch(url),
  // )

  const rawResponse = await fetch(url, {
    mode: 'no-cors',
  })

  await rawResponse.text()

  // const listings = response.items.map(async item => {
  //   const schema = await getLDSchema(item.link)
  //   const parsed = parseJobSchema(schema)
  //   return parsed
  // })

  console.log(listings)
}

searchJobs()
