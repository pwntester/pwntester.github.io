(function($) {

	$.fn.Tapirus = function(token, options) {

		options = $.extend({
			dateFormat: 'MMMM D, YYYY',
			queryFilter: undefined,
			inputSelector: 'input[type="search"]',
			sessionStorage: false,
			sortBy: undefined,
			templates: {
				count: '<h3 class="search-results-count">{{count}} results for <q>{{query}}</q></h3>',
				result: '<div class="search-result"><h2 class="post-title"><a href="{{link}}">{{title}}</a></h2><time class="post-date" datetime="{{published_on}}">{{date}}</div>',
			},
		},
		options);


		// Elements

		var $window = $(window),
			$body = $(document.body),
			$input = $(options.inputSelector),
			$form = $input.parent(),
			$element = $(this);


		// Setup Tapir

		var tapir = Tapir(token, options.url);

		// API

		var self = {
				reset: function() {
					$element.empty();
					$body.removeClass('search-active');
					sessionStorage.removeItem('tapirsearchquery');
				},

				submit: function(query) {

					if(query === '') return;

					tapir
					.search(query, options.queryFilter, options.sortBy)
					.done(function(results) {

						if(results.length) {
							var uniqueResults = [];
							$(results).each(function() {
								if (uniqueResults.indexOf(this.title) < 0) {
									uniqueResults[uniqueResults.length] = this.title;
								}
							});
							$element.append(Handlebars.compile(options.templates.count)({count: uniqueResults.length, query: query}));

							var processedItems = [];
							$(results).each(function() {
								if (processedItems.indexOf(this.title) < 0) {
									processedItems[processedItems.length] = this.title;
									// Add formatted date
									if(typeof moment === 'function') this.date = moment(this.published_on).format(options.dateFormat);

									var keywords = query.split(' ');
									if (this.content == null) this.content = this.summary;
									if (this.content != null) {
										var lines = this.content.split('\n');
										var preview = [];
										var appendLine = false;
										lines.forEach(function(line) {
											keywords.forEach(function(keyword) {
												line = line.toLowerCase();
												keyword = keyword.toLowerCase();

												var pos = line.indexOf(keyword);
												var numerOfWrappingChars = 40;

												if (pos > -1) {
												  line.lastIndexOf(' ',start)
												  var start = (pos - numerOfWrappingChars > 0) ? pos - numerOfWrappingChars : 0;
												  var wordstart = line.lastIndexOf(' ',start);
												  if (wordstart > -1 && wordstart < start) start = wordstart;
												  var end = (pos + keyword.length + numerOfWrappingChars < line.length) ? pos + keyword.length + numerOfWrappingChars  : line.length - 1;
												  var wordend = line.indexOf(' ',end);
												  if (wordend > -1 && wordend > end) end = wordend;
												  line = line.substring(start, end);

												  line = line.replace(keyword,'<strong>' + keyword + '</strong>');
												  line = line.replace('<p>','').replace('</p>','').replace('<br>','').replace('<br/>','').replace('</br>','');
												  appendLine = true;
												}

										    });
										    if (appendLine) { //&& preview.length < 3) {
										    	preview[preview.length] = line;
										    }
										    appendLine = false;
										});
										if (preview.length > 0) {
											this.snippet = "... " + preview.join(' ... ') + " ...";
										}
										var $dummy = $('<div></div>').html(Handlebars.compile(options.templates.result, {noEscape: true})(this));
										$element.append($dummy.html());
									}
								}
							});
						}
						else {
							$element.append(Handlebars.compile(options.templates.count)({count: 0, query: query}));
						}

						$body.addClass('search-active');

						// Save
						if(options.sessionStorage) {

							sessionStorage.setItem('tapirsearchquery', query);
							sessionStorage.setItem('tapirsearchcache', JSON.stringify(tapir.getCache()));
						}
					});
				},
			};


		// Session

		if(options.sessionStorage) {

			var cache = sessionStorage.getItem('tapirsearchcache'),
				query = sessionStorage.getItem('tapirsearchquery');

			if(cache) {

				tapir.setCache(JSON.parse(cache));
			}

			if(query) {

				self.submit(query);
				$input.val(query);
			}
		}


		// Events

		$form
		.on('reset', function(event) {

			self.reset();
		})
		.on('submit', function(event) {

			event.preventDefault();

			self.reset();
			self.submit($input.val());
		});

		$input.on('input', function() {

			if($(this).val() === '') self.reset();
		});


		// Core Tapir search

		function Tapir(token, url) {

			var cache = {};

			url = url || 'http://tapirgo.com/api/1/search.json?token=%token&query=%query&callback=?';
			url = url.replace('%token', token);

			return {
				getCache: function() {

					return cache;
				},

				setCache: function(newcache) {

					cache = newcache;
				},

				search: function(query, queryFilter, sortBy) {

					var deferred = $.Deferred();

					query = (typeof queryFilter === 'function' ? queryFilter(query) : query.replace(/\W/g, ''));

					// Empty
					if(query === '') {

						resolve([]);
					}
					// In cache
					else if(cache[query]) {

						resolve(cache[query]);
					}
					// Load to cache
					else {

						$.getJSON(url.replace('%query', encodeURI(query)))
						.done(function(results) {

							resolve(cache[query] = results);
						});
					}

					function resolve(results) {

						if(results.length && typeof sortBy === 'string') {

							results = results.sort(function(a, b) {

								var x = a[sortBy],
									y = b[sortBy];

								return ((x < y) ? -1 : ((x > y) ? 1 : 0));
							});
						}

						deferred.resolve(results);
					}

					// Promise results
					return deferred.promise();
				},
			}
		}

		return this;
	};
})
(jQuery);
