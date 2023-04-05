export function paginateResults(page, limit, model) {
  // console.log(page, limit, model);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalPages = Math.ceil(model.length / limit);
  // console.log("totalPages", totalPages);

  const results = {};
  results.totalPosts = model.length;

  results.totalPages = totalPages;

  if (endIndex < model.length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  results.results = model.slice(startIndex, endIndex);
  // console.log("results", results);
  return results;
}
