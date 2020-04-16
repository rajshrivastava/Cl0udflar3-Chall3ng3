var global_random;

class PageTitleRewriter
{
 element(element)
 {
    if (global_random == 0) {
      element.setInnerContent("Modified title 1");
    }
    else{
     element.setInnerContent("Modified title 2"); 
    }
 }
}

class BodyTitleRewriter
{
 element(element)
 {
    if (global_random == 0) {
      element.setInnerContent("Developer's variant 1");
    }
    else{
     element.setInnerContent("Developer's variant 2"); 
    }
 }
}

class DescriptionRewriter
{
 element(element)
 {
  if (global_random == 0) {
      element.replace("This is developer's variant 1 of take home project");
    }
    else{
     element.replace("This is developers' variant 2 of take home project");
    }
 }
}

class URLRewriter
{
 element(element)
 {
  if (global_random == 0) {
      element.setAttribute("href", "https://www.linkedin.com/in/rajshrivastava/");
      element.setInnerContent("Developer's LinkedIn")
    }
    else{
     element.setAttribute("href", "https://github.com/rajshrivastava");
     element.setInnerContent("Developer's GitHub")
    }

    
 }
}

//HTMLRewriters for modifying content
const rewriter_PageTitle = new HTMLRewriter().on(`title`, new PageTitleRewriter())
const rewriter_BodyTitle = new HTMLRewriter().on(`h1#title`, new BodyTitleRewriter())
const rewriter_description = new HTMLRewriter().on(`p#description`, new DescriptionRewriter())
const rewriter_url = new HTMLRewriter().on(`a#url`, new URLRewriter())

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {

  fetch_result = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
.then(function(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.json();
})
.then(async function(responseBody) {
  const NAME = 'variant'
  const cookie = request.headers.get('cookie')
  console.log(cookie)
  let variant_1_response = await getVariantResponse(responseBody['variants'][0])
  let variant_2_response = await getVariantResponse(responseBody['variants'][1])

  console.log(variant_1_response)
  
  if (cookie && cookie.includes(`${NAME}=0`)) {
    return variant_1_response
  } else if (cookie && cookie.includes(`${NAME}=1`)) {
    return variant_2_response
  } else {
    global_random = Math.random() < 0.5 ? 0 : 1 
    console.log(global_random)
    if (global_random === 0) {
      response = new Response(variant_1_response.body, variant_1_response)
    }
    else {
      response = new Response(variant_1_response.body, variant_2_response)
    }
    console.log(response)

    response.headers.append('Set-Cookie', `${NAME}=${global_random}; path=/; Max-Age=31536000`)
    console.log(response.headers.get('Set-Cookie'))
    return response
  }
  })
.catch(function(error) {
  console.log('ERROR in handleRequest: \n', error);
});

  fetch_result = rewriter_PageTitle.transform(fetch_result)
  fetch_result = rewriter_BodyTitle.transform(fetch_result)
  fetch_result = rewriter_description.transform(fetch_result)
  fetch_result = rewriter_url.transform(fetch_result)
  return fetch_result
}

async function getVariantResponse(newURL) {
  fetch_result = await fetch(newURL)
  .then(function(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
    return response;
  })
  .then(function(responseBody) {
 
    return responseBody
  })
  .catch(function(error) {
    console.log('ERROR in getVariantResponse: \n', error);
  });
  return fetch_result
}