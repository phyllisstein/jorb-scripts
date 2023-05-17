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
  // const res = UrlFetchApp.fetch(link)
  const rawRes = await fetch(link, {
    // mode: 'no-cors',
    // credentials: 'omit',
    // headers: {
    //   'Accept': 'text/html',
    //   'Referer': 'https://www.google.com/',
    // },
  })

  if (!rawRes.ok) {
    console.warn(`Error fetching ${link}: ${rawRes.status} ${rawRes.statusText}`)
    debugger
    return
  }

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

  const ret = JSON.parse(text)

  console.log({ ret, link, text })

  return ret
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
  // const key = 'AIzaSyBw7bI80qOT-YR6a7I7u2qROz24D8KzSUA'
  // const key = 'a64a2e4c369d5d0a5e4e8194a66903ee07517f5c'
  const key = 'AIzaSyAnPxo5sufX4UVE7CF-dGAX3wUcwgCkTb4'
  const cx = '415e89368a92c46a5'

  // site:
  const sites = [
    'boards.greenhouse.io',
    'jobs.lever.co',
    // 'jobs.smartrecruiters.com',    // TODO: Parse richer schema from Google results.
    'apply.workable.com',
    'jobs.jobvite.com',
  ]

  // excludeTerms
  const excludeTerms = [
    'basis',
    // 'c#',
  ]

  // hq
  const requiredTerms = [
    'ruby',
  ]

  // q (throwaway)
  const q = 'job'

  const sitesParam = sites.map(v=>`site:${v}`).join(' ')
  const requiredTermsParam = requiredTerms.join(' ')
  const excludeTermsParam = excludeTerms.join(' ')

  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${cx}&q=${encodeURIComponent(q)}&orTerms=${encodeURIComponent(sitesParam)}&excludeTerms=${encodeURIComponent(excludeTermsParam)}&hq=${encodeURIComponent(requiredTermsParam)}&dateRestrict=d1`
  // const url = `https://cse.google.com/cse?key=${encodeURIComponent(key)}&cx=${cx}&q=${encodeURIComponent(q)}&orTerms=${encodeURIComponent(sitesParam)}&excludeTerms=${encodeURIComponent(excludeTermsParam)}&hq=${encodeURIComponent(requiredTermsParam)}&dateRestrict=d1`

  // const response = JSON.parse(
  //   UrlFetchApp.fetch(url),
  // )

  const rawResponse = await fetch(url, {
    // mode: 'no-cors',
  })

  const response = await rawResponse.json()

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
