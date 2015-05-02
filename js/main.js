var links, nodes;
var force, svg, credits;
var link, node;
var border = 50;
var fixed = false;
var iterations = 100;
var ignored = ['Avestruz'];

function main(data) {
    nodes = {};
    links = [];

    var maxWeight = 0;
    $.each(data, function(i, conn) {
        if ($.inArray(conn.nick1, ignored) != -1 || $.inArray(conn.nick2, ignored) != -1)
            return;

        var link = {};
        links.push(link);

        link.source = nodes[conn.nick1] || (nodes[conn.nick1] = { name: conn.nick1 });
        link.target = nodes[conn.nick2] || (nodes[conn.nick2] = { name: conn.nick2 });
        link.weight = conn.weight/10;

        maxWeight = Math.max(maxWeight, link.weight);
    });

    force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .on("tick", tick)
        .gravity(0.2)
        .friction(0.9)

    svg = d3.select("body").append("svg");

    credits = svg.append("text")
        .text("42");

    link = svg.selectAll(".link")
        .data(force.links())
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return (Math.log(d.weight+1)*0.5)+1 })
        .style("opacity", function(d) { return (d.weight/maxWeight)*0.7+(1-0.7); });

    node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .call(force.drag);

    node.append("circle")
        .attr("r", 8);

    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name;
        });

    window.onresize = resizeElements;
    resizeElements();

    force.start();
    for (var i = iterations * iterations; i > 0; --i) force.tick();
    force.friction(0.8);
    force.alpha(0.02)

    if (fixed) {
        force.stop();
    }

}

function tick() {
    link
        .attr("x1", function(d) {
            return d.source.x;
        })

        .attr("y1", function(d) {
            return d.source.y;
        })
        
        .attr("x2", function(d) {
            return d.target.x;
        })
        
        .attr("y2", function(d) {
            return d.target.y;
        });

    node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
}

function resizeElements(){
    width = $(window).width();
    height = $(window).height()

    force
        .size([width, height])
        .alpha(0.01)
        .charge(-2000)
        .linkDistance(height/5)
        .linkStrength(1);

    svg
        .attr("width", width)
        .attr("height", height);

    console.log("Resized...");
}

function mouseover(d) {
  link
    .attr("class", function(l) {
        if (d === l.source || d === l.target)
          return "link highlighted";
        else
          return "link";
    });
}

function mouseout() {
    link
        .attr("class", "link");
}

$.getJSON('//chanstat.net/cs/relationshipdata.php' + location.search, function(data) {
    main(data);
});
