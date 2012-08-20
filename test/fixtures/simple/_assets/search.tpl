<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
        <title>{{title}}</title>
        <link type="text/css" href="_assets/style.css" rel="stylesheet">
	</head>
	<body class="search">
		<header>
			<form class="search" method="post" action="search">
				<input type="search" name="searched" placeHolder="quicksearch..."/>
				<button>
					<img src="_assets/search.png"/>
				</button>
			</form>
        </header>
       	<div class="main-title">Search results for <b>{{searched}}</b>:</div>
        <div class="main">
        	{{#results}}
       			<div class="search-result">
       				<a href="{{url}}">{{name}}</a>
       				{{#hits}}
       					<div class="hit">{{val}}</div>
       				{{/hits}}
       			</li>
        	{{/results}}
        	</ul>
        	{{^results}}
        		<div class="no-result">No results found !</div>
        	{{/results}}
        </div>
	</body>
</html>