function myFunction() {

  const key = <YOUR API>

  const cx = <YOUR CX>
  //const q = 'site:https://boards.greenhouse.io (frontend OR front end OR front-end) AND react AND "new york"'
  //const q = 'site:https://boards.greenhouse.io react.js AND "new york"'
  //const q = 'site:https://boards.greenhouse.io  "Site Reliability" AND "new york"'
  const q = 'site:https://boards.greenhouse.io  python AND "new york"'


  //function findCompanyByAltName(altName = 'Chase2222'){

/*
  // Build custom url
  var url = urlTemplate
    .replace("%KEY%", encodeURIComponent(ApiKey))
    .replace("%CX%", encodeURIComponent(searchEngineID))
    .replace("%Q%", encodeURIComponent(query));

  var params = {
    muteHttpExceptions: true
  };
*/
  // Perform search
//  Logger.log( UrlFetchApp.getRequest(url, params) );  // Log query to be sent
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${cx}&q=${encodeURIComponent(q)}&dateRestrict=d1`
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  //console.log(result.kind, result.url)
  console.log(result.queries.request, result.queries.nextPage)
  //result.queries.forEach(v=>console.log(v.request, v.nextPage))
  result.items.forEach(v=>console.log(v.link, v.snippet, v.link
))
  //result.forEach(v=>console.log(v.items))
  /*
  const res = UrlFetchApp.fetch ('https://boards.greenhouse.io/clear/jobs/4989080')
  const text = res.getContentText()
  console.log(text.slice(25000))
  */

}

const extractName = (url) =>  url.match(/(?<=greenhouse\.io\/).*?(?=\/jobs)/)

const textExtractName = () =>  console.log(extractName('https://boards.greenhouse.io/mavenclinic/jobs/6640614002'))

/*
<script async src="https://cse.google.com/cse.js?cx=e7d659c37f13d4509">
</script>
<div class="gcse-search"></div>
*/

/*
{ kind: 'customsearch#search',
  url: { type: 'application/json',
     template: 'https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&relatedSite={relatedSite?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json'
    },
  queries: { request: [ [Object] ], nextPage: [ [Object] ] },
  context: { title: 'jobScraper' },
  searchInformation:
   { searchTime: 0.285203,
     formattedSearchTime: '0.29',
     totalResults: '1760',
     formattedTotalResults: '1,760' },
  items:
   [ { kind: 'customsearch#result',
       title: 'Job Application for Senior Front End Engineer at Maven Clinic',
       htmlTitle: 'Job Application for Senior <b>Front End</b> Engineer at Maven Clinic',
       link: 'https://boards.greenhouse.io/mavenclinic/jobs/6640614002',
       displayLink: 'boards.greenhouse.io',
       snippet: 'Senior Front End Engineer ... New York, NY; San Francisco, CA; Remote, US ... CSS, JavaScript, react and other relevant frontend technologies.',
       htmlSnippet: 'Senior <b>Front End</b> Engineer ... <b>New York</b>, <b>NY</b>; San Francisco, CA; Remote, US ... CSS, JavaScript, <b>react</b> and other relevant <b>frontend</b> technologies.',
       cacheId: 'VtQ9LZL8c54J',
       formattedUrl: 'https://boards.greenhouse.io/mavenclinic/jobs/6640614002',
       htmlFormattedUrl: 'https://boards.greenhouse.io/mavenclinic/jobs/6640614002',
       pagemap: [Object] },
       */
