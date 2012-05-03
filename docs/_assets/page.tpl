<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
        <title>Easydoc</title>
        <link type="text/css" href="_assets/style.css" rel="stylesheet">
	</head>
	<body class="page">
		<header>
			<form class="search" method="post" action="search">
				<input type="search" name="searched" placeHolder="quicksearch..."/>
				<button>
					<img src="_assets/search.png"/>
				</button>
			</form>
        </header>
       	<div class="main-title">Your product documentation</div>
        <nav>
			<h1>Page index</h1>
			<ul>
			{{#pages}}
				<li><a href="{{url}}">{{name}}</a></li>
			{{/pages}}
			</ul>
		</nav>
        <div class="main">
        	{{{content}}}
        </div>
	</body>
</html>