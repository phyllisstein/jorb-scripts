function searchJobs() {
  const key = 'AIzaSyBw7bI80qOT-YR6a7I7u2qROz24D8KzSUA'
  const cx = '415e89368a92c46a5'

  // site:
  const sites = [
    'boards.greenhouse.io',
    'jobs.lever.co',
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
  const response = UrlFetchApp.fetch(url);
  console.log(JSON.stringify(response.getContentText(), null, 2))
}

searchJobs()
