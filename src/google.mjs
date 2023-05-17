import cheerio from 'cheerio'
import pMap from 'p-map-series'

/**
 * Grab the JSON-LD schema from the job listing page. Every site but
 * SmartRecruiters embeds a script tag with its structured Schema.org metadata.
 *
 * @param {string} link - The link to the job listing, extracted from the search
 *                        results
 */
async function getLDSchema(link) {
  /**
   * WARN: The Fetch API is available in Node.js and browser runtimes, but not
   * in Google Apps Scripts. The first request uses Node's API. The
   * commented-out alternative uses Google's.
   */
  const rawRes = await fetch(link)
  // const res = UrlFetchApp.fetch(link)

  if (!rawRes.ok) {
    console.warn(`Error fetching ${ link }: ${ rawRes.status } ${ rawRes.statusText }`)
    return
  }

  /**
   * WARN: As with the preceding, Response#text is a Node API, and
   * HTTPResponse#getContentText is a Google Apps Script API.
   */
  const markup = await rawRes.text()
  // const markup = res.getContentText()

  const $ = cheerio.load(markup)
  const tags = $('script[type="application/ld+json"]')

  if (tags.length === 0) {
    console.warn(`No JSON-LD schema found for ${link}`)
    return
  }

  const tag = tags[0]
  const text = $(tag).text()
  return JSON.parse(text)
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
  let {
    title,
    hiringOrganization,
    description,
    employmentType,
    datePosted,
    jobLocation,
  } = rawJSON

  if (hiringOrganization && typeof hiringOrganization === 'object') {
    hiringOrganization = hiringOrganization.name
  } else if (hiringOrganization && typeof hiringOrganization === 'string') {
    hiringOrganization = 'unknown'
  }

  if (
    jobLocation &&
    typeof jobLocation === 'object' &&
    jobLocation.address &&
    typeof jobLocation.address === 'object'
  ) {
      jobLocation = jobLocation.address.addressLocality
    }

  return {
    datePosted,
    title,
    hiringOrganization,
    description,
    title,
    employmentType,
    jobLocation,
  }
}

async function searchJobs() {
  const key = 'AIzaSyAnPxo5sufX4UVE7CF-dGAX3wUcwgCkTb4'
  const cx = '415e89368a92c46a5'

  // Job boards to seaarch. (Google-specific syntax is unnecessary. Just add domain names.)
  const sites = [
    'boards.greenhouse.io',
    'jobs.lever.co',
    // TODO: Parse the richer schema returned directly in Google's results.
    // 'jobs.smartrecruiters.com',
    'apply.workable.com',
    'jobs.jobvite.com',
  ]

  // Results containing ANY of these terms will be excluded, whether or not the
  // other terms are present.
  const excludeTerms = [
    'basis',
    // 'c#',
  ]

  // These are OR'd together. Results must contain at least one of them.
  const requiredTerms = [
    'ruby',
  ]

  // We don't care that much whether a random unstructured keyword is present.
  const q = 'job'

  /**
   * Construct search URL.
   */
  const sitesParam = sites.map(v=>`site:${v}`).join(' ')
  const requiredTermsParam = requiredTerms.join(' ')
  const excludeTermsParam = excludeTerms.join(' ')
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${cx}&q=${encodeURIComponent(q)}&orTerms=${encodeURIComponent(sitesParam)}&excludeTerms=${encodeURIComponent(excludeTermsParam)}&hq=${encodeURIComponent(requiredTermsParam)}&dateRestrict=d1`

  // WARN: See previous warnings about Google vs. Node runtimes. This is Node.
  const rawResponse = await fetch(url)
  const response = await rawResponse.json()
  // const response = JSON.parse(
  //   UrlFetchApp.fetch(url),
  // )

  const listings = await pMap(response.items, async item => {
    const schema = await getLDSchema(item.link)

    if (!schema) {
      return
    }

    const parsed = parseJobSchema(schema)
    parsed.link = item.link
    return parsed
  })

  console.log(listings)
}

searchJobs()
