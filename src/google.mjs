import cheerio from 'cheerio'
import pMap from 'p-map-series'

/**
 * Job boards to seaarch. (Google-specific syntax is unnecessary. Just write
 * domain names.)
 */
const JOB_BOARD_SITES = [
  'boards.greenhouse.io',
  'jobs.lever.co',
  // TODO: Parse the richer schema returned directly in Google's results.
  // 'jobs.smartrecruiters.com',
  'apply.workable.com',
  'jobs.jobvite.com',
]

/**
 * Results containing ANY of these terms will be excluded, whether or not the
 * other terms are present.
 *
 * You may be able to exclude phrases by wrapping them in double quotes:
 *
 *    '"death star"'
 *
 * Just thinking out loud. Test at your own peril.
 */
const EXCLUDED_TERMS = [
  'c#',
]

/**
 * These terms are OR'd together. Results must contain at least one of them. See
 * the above comment about phrases.
 */
const REQUIRED_TERMS = [
  'java',
]

/**
 * Super useless: thanks to excluded/included terms, we don't care that much
 * whether a random unstructured keyword is present. Google still requires it.
 */
const QUERY_STRING = 'job'

/**
 * Kick off a search. This is the entry point for the script.
 */
async function searchJobs() {
  const key = 'AIzaSyAnPxo5sufX4UVE7CF-dGAX3wUcwgCkTb4'
  const cx = '415e89368a92c46a5'

  /**
   * Construct search URL.
   */
  const sitesParam = JOB_BOARD_SITES.map(v=>`site:${v}`).join(' ')
  const requiredTermsParam = REQUIRED_TERMS.join(' ')
  const excludeTermsParam = EXCLUDED_TERMS.join(' ')
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${cx}&q=${encodeURIComponent(QUERY_STRING)}&orTerms=${encodeURIComponent(sitesParam)}&excludeTerms=${encodeURIComponent(excludeTermsParam)}&hq=${encodeURIComponent(requiredTermsParam)}&dateRestrict=d1`

  /**
   * WARN: The Fetch API is available in Node.js and browser runtimes, but not
   * in Google Apps Scripts. The first request uses Node's API. The
   * commented-out alternative uses Google's.
   */
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

  console.log(listings.filter(Boolean))
}

/**
 * Grab the JSON-LD schema from the job listing page. Every site but
 * SmartRecruiters embeds a script tag with its structured Schema.org metadata.
 *
 * @param {string} link - The link to the job listing, extracted from the search
 *                        results
 */
async function getLDSchema(link) {
  /**
   * WARN: See note above regarding the Fetch API.
   */
  const rawRes = await fetch(link)
  // const res = UrlFetchApp.fetch(link)

  if (!rawRes.ok) {
    console.warn(`Error fetching ${ link }: ${ rawRes.status } ${ rawRes.statusText }`)
    return
  }

  /**
   * WARN: Another quirk of browsers vs. Google, Response#text is a Node API,
   * and HTTPResponse#getContentText is a Google Apps Script API.
   */
  const markup = await rawRes.text()
  // const markup = res.getContentText()

  const $ = cheerio.load(markup)
  const tags = $('script[type="application/ld+json"]')

  if (tags.length === 0) {
    console.warn(`No JSON-LD schema on the page ${link}`)
    return
  }

  const tag = tags[0]
  const text = $(tag).text()

  if (text == null) {
    console.warn(`No text found for ${link} JSON-LD tag`)
    return
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    console.warn(`Error parsing JSON-LD schema for ${link}: ${e.message}`)
  }
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

searchJobs()
