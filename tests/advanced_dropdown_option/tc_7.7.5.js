/* 
 Author: Arko
 Description:    When a published notebook is loaded by a user who is not logged-in, the output of all the cells of that notebook will be displayed.
 On clicking the "Run All" icon present on the top-left corner of the page, all the cells of the notebook should run again
 */

//Begin Tests
casper.test.begin("For a published notebook ,run all the cells using 'Run All' option", 7, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;
    var title;
    var input_code = "a<-50+50\n a";
    var expectedresult = "100"

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);

    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Get notebook title
    casper.wait(1000).then(function () {
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //getting Notebook ID
    casper.wait(100).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //add a new cell and execute its contents    
    casper.wait(1000).then(function(){
        functions.addnewcell(casper);
    });

    casper.wait(3000).then(function(){
        functions.addcontentstocell(casper,input_code);
    });
    

    //Now clicking on the advanced div
    casper.wait(2000).then(function(){
		functions.open_advanceddiv(casper);
		this.echo("Clicking on advance drop down menu");
	});
    
    //clicking the checkbox to publish notebook
    casper.wait(1000).then(function () {
		this.wait(2000);
        var z = casper.evaluate(function () {
            $('.icon-check-empty').click();
            this.wait(3000);
		});
		this.echo("Clicking on publish notebook");
        //logout of RCloud & Github
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log('Logging out of RCloud');   
        this.wait(3000);
    });
    
    
    
    casper.wait(1000).then(function () {
        this.click("#main-div > p:nth-child(2) > a:nth-child(2)", "Logged out of Github");
        console.log('Logging out of Github');
        this.wait(3000);
    });

    casper.wait(3000).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(7000);
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
    });

    //load the view.html of the Published notebook
    casper.wait(1000).then(function () {
        sharedlink = "http://127.0.0.1:8080/view.html?notebook=" + notebookid;
        this.thenOpen(sharedlink, function () {
        this.wait(2000);
        this.echo("Opened the view.html of the published notebook " + title);
        });
    });

    //verify that the published notebook has been loaded
    casper.wait(2000).then(function () {
        publishedtitle=this.fetchText('#notebook-title');
        this.echo("Published Notebook title : " + publishedtitle);
        this.test.assertEquals(publishedtitle, title, "Confirmed that the view.html of published notebook has been loaded");
    });

    //Run all the cells and verify that the output divs are visible
    functions.runall(casper);
    casper.wait(2000).then(function () {
        this.test.assertSelectorHasText({type: 'xpath', path: "/html/body/div[3]/div/div/div/div[1]/div/div[2]/div[2]"}, expectedresult,'Cells have been executed successfully');
    });

    casper.run(function () {
        test.done();
    });
});
