var router = require('express').Router();
var path = require('path');
var pool = require('../modules/pool.js');

//on New Intake Page Load

//Requests for populating form fields
router.get('/cities', function (req, res) {
  console.log('In cities Get for intake');
  // check if logged in
  if (req.isAuthenticated()) {
    pool.connect(function (conErr, client, done) {
      if (conErr) {
        res.sendStatus(500);
      } else {
        client.query('SELECT * FROM cities', function (queryErr, resultObj) {
          done();
          if (queryErr) {
            res.sendStatus(500);
          } else {
            res.send(resultObj.rows);
          }
        });
      }
    })
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  }
});//end cities Get call

router.get('/counties', function (req, res) {
  console.log('In counties Get for intake');
  // check if logged in
  if (req.isAuthenticated()) {
    pool.connect(function (conErr, client, done) {
      if (conErr) {
        res.sendStatus(500);
      } else {
        client.query('SELECT * FROM counties', function (queryErr, resultObj) {
          done();
          if (queryErr) {
            res.sendStatus(500);
          } else {
            res.send(resultObj.rows);
          }
        });
      }
    })
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  }
}); //end counties get call

router.get('/lawEnforcement', function (req, res) {
  console.log('In lawEnforcement Get for intake');
  // check if logged in
  if (req.isAuthenticated()) {
    pool.connect(function (conErr, client, done) {
      if (conErr) {
        res.sendStatus(500);
      } else {
        client.query('SELECT * FROM law_enforcement', function (queryErr, resultObj) {
          done();
          if (queryErr) {
            res.sendStatus(500);
          } else {
            res.send(resultObj.rows);
          }
        });
      }
    })
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  }
});// end law enforcement Get call

router.get('/schools', function (req, res) {
  console.log('In schools Get for intake');
  // check if logged in
  if (req.isAuthenticated()) {
    pool.connect(function (conErr, client, done) {
      if (conErr) {
        res.sendStatus(500);
      } else {
        client.query('SELECT * FROM schools', function (queryErr, resultObj) {
          done();
          if (queryErr) {
            res.sendStatus(500);
          } else {
            res.send(resultObj.rows);
          }
        });
      }
    })
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  }
}); //end schools get call

router.post('/newVulnerabilities', function (req, res) {
  var newVulnId = req.body.id;
  var newVulnArray = req.body.array
  console.log('In Post for new vulnerabilities', newVulnId, newVulnArray);
  // check if logged in
  if (req.isAuthenticated()) {
    pool.connect(function (conErr, client, done) {
      if (conErr) {
        res.sendStatus(500);
      } else {
          for(let i = 0; i < newVulnArray.length; i++) {
            var sqlQuery = 'INSERT INTO case_vulnerabilities (case_data_id, vulnerabilities_id) VALUES $1, (SELECT (id) FROM vulnerabilites WHERE vulnerability = $2) '
            var valueArray = [newVulnId, newVulnArray[i]]
            client.query(sqlQuery, valueArray, function (queryErr, resultObj) {
            done();
            if (queryErr) {
              res.sendStatus(500);
              } else {
              res.send(202);
            } //end if statement
          } //end for loop
        )}; //end else
      } // end big else
    }) //end pool
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  }
}); //end input vulnerabilities Post

//new Intake Form
router.post('/newIntake', function (req, res) {      //  --1
  var newIntake = req.body;
  console.log('In Post for new intake', newIntake);
  // check if logged in
  if (req.isAuthenticated()) { // --2
    pool.connect(function (conErr, client, done) { // --3 
      if (conErr) {
        res.sendStatus(500);
      } 
      else { //--4     - main query -
        var caseDataQuery = 'INSERT INTO case_data (mcm_number, intake_date, age, gender, last_seen, reported_missing, people_served, city, county, state, school, start_case_type, end_case_type, disposition, close_date, referral_type, case_status) VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT id FROM cities WHERE city_name = $8), (SELECT id FROM counties WHERE county_name = $9), $10, (SELECT id FROM schools WHERE school_name = $11), $12, $13, $14, $15, $16, $17) RETURNING id;' 
        var caseDataValueArray = [newIntake.mcm_number, newIntake.intake_date, newIntake.age, newIntake.gender, newIntake.last_seen, newIntake.reported_missing, newIntake.people_served, newIntake.city_name, newIntake.county_name, newIntake.state, newIntake.school_name, newIntake.start_case_type, newIntake.end_case_type, newIntake.disposition, newIntake.close_date, newIntake.referral_type, newIntake.case_status]
        console.log('caseDataQuery, caseDataValue', caseDataQuery, caseDataValueArray)
        client.query(caseDataQuery, caseDataValueArray, function (queryErr, resultObj) {  // --5
          done(); 
          if (queryErr) { // for id
            console.log('caseData query Error', queryErr)
            res.sendStatus(500); 
          } else { // - vulnerabilities query  --6
              //variables for vulnerabilities
              console.log('id', resultObj.rows[0].id)             
              var tempVArray = []
              var vulnerabilityArray = []
              var vulnerabilityCount = 1
              
              var createVulnQuery = function() {
                for (let i = 0; i < newIntake.case_vulnerabilities.length; i++) {
                  tempVArray.push('('+resultObj.rows[0].id+ ', (Select id FROM vulnerabilities WHERE vulnerability = $'+vulnerabilityCount++ + '))');
                  vulnerabilityArray.push(newIntake.case_vulnerabilities[i].name);
                  }  //end for loop
                } //end create Query function
              
                createVulnQuery(); 
                console.log('tempArray', tempVArray)
                var vulnerabilities$ = tempVArray.join(', ')
                var vulnerabilityInsert = 'INSERT INTO case_vulnerabilities(case_data_id, vulnerabilities_id) VALUES ' 
                var vulnerabilityQuery = vulnerabilityInsert + vulnerabilities$
                console.log('Query, valueArray', vulnerabilityQuery, vulnerabilityArray)
              
                client.query(vulnerabilityQuery, vulnerabilityArray, function (queryErr, resultVulnerability) { // --7
              done();
                if (queryErr) {
                  console.log('Vulnerability query Error', queryErr)
                res.sendStatus(500);
                } else { // start race_ethnicity query  //--8
                  console.log('219 newIntake.race_ethnicity', newIntake.race_ethnicity.name)  
                    //variables for race_enthinicity                 
                    var tempRaceArray = []
                    var raceValueArray = []
                    var raceCount = 1                   
                    var createRaceQuery = function() {
                      console.log('createRaceQuery running', newIntake.race_ethnicity[0].name)
                      for (let j = 0; j < newIntake.race_ethnicity.length; j++) {
                      console.log('for loop running w/ j', j);
                      tempRaceArray.push('('+resultObj.rows[0].id+ ', (Select id FROM race_ethnicity WHERE race_ethnicity = $'+raceCount++ + '))');
                      raceValueArray.push(newIntake.race_ethnicity[j].name);
                       }  
                      console.log('raceValueArray', raceValueArray)
                      } //end function
                    
                      createRaceQuery();
                      console.log('tempArray', tempRaceArray)
                      var raceValue$ = tempRaceArray.join(', ')
                      var raceInsert = 'INSERT INTO case_race_ethnicity (case_data_id, race_ethnicity_id) VALUES ' 
                      var raceQuery = raceInsert + raceValue$
                      console.log('reSqlQuery, valueArray', raceQuery, raceValueArray)
                    
                      client.query(raceQuery, raceValueArray, function (queryErr, raceResult) { // --9
                    done();
                      if (queryErr) {
                        console.log(queryErr)
                        res.sendStatus(500);
                      } else {  // -- 10
                        //start agency Query
                        var tempAgencyArray = []
                        var agencyArray = []
                        var agencyCount = 1
                        
                        var createAgencyQuery = function() {
                          for (let l = 0; l < newIntake.case_lawenforcement_denial.length; l++) {
                            tempAgencyArray.push('('+resultObj.rows[0].id+ ', (Select id FROM law_enforcement WHERE agency = $'+agencyCount++ + '), $' +agencyCount++ +')')
                            agencyArray.push(newIntake.case_lawenforcement_denial[l].name, newIntake.case_lawenforcement_denial[l].denial);
                            }  //end for loop
                          } //end creqte Query function
                        
                          createAgencyQuery(); //2nd query for vulnerabilites
                          console.log('tempAgencyArray', tempAgencyArray)
                          var agencies$ = tempAgencyArray.join(', ')
                          var agencyInsert = 'INSERT INTO case_lawenforcement_denial (case_data_id, law_enforcement_id, jurisdictional_denial) VALUES ' 
                          var agencyQuery = agencyInsert + agencies$
                          console.log('Query, agencyQuery', agencyQuery, agencyArray)
                        
                          client.query(agencyQuery, agencyArray, function (queryErr, resultAgency) { // --11
                        done();
                          if (queryErr) { //if 2nd query fails
                            console.log('Agency query Error', queryErr)
                          res.sendStatus(500);
                          } else {  // --12
                                res.sendStatus(202);
                                } // --12
                              
                        }) // -- 11
                      } // --10                       
              }) // --9
              } // --8
            }) // --7
          } // --6
        }) // --5  
      } // --4
    }) // --3
  } else { // --2
    console.log('not logged in');
    res.send(false);
  } //end authentication else  
}); //end /newIntake  --1


// locate case to Edit
router.get('/caseToEdit/:id', function (req, res) {
  var mcmCase = req.params.id
  console.log('In get for caseToEdit', mcmCase);
  if (req.isAuthenticated()) {
    console.log('isAuthentication')
    pool.connect(function (conErr, client, done) {
      console.log('poolconnect')
      if (conErr) {
        res.sendStatus(500);
      } else {
        var valueArray = [mcmCase]
        console.log('valueArray')
        client.query('SELECT * FROM case_data INNER JOIN case_lawenforcement_denial ON case_lawenforcement_denial.case_data_id = case_data.id Inner JOIN law_enforcement ON case_lawenforcement_denial.law_enforcement_id = law_enforcement.id Inner join case_race_ethnicity ON case_race_ethnicity.case_data_id = case_data.id Inner Join race_ethnicity On case_race_ethnicity.race_ethnicity_id =race_ethnicity.id Inner Join case_vulnerabilities On case_vulnerabilities.case_data_id =case_data.id Inner Join vulnerabilities On case_vulnerabilities.vulnerabilities_id = vulnerabilities.id Where mcm_number = $1', valueArray, function (queryErr, resultObj) {
          done();
          if (queryErr) {
            console.log('done 500')
            res.sendStatus(500);
          } else {
            res.send(resultObj.rows);
            console.log('resultobj', resultObj.rows)
          }
        });
      }
    })
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  } //end else
}); //end editForm get call

//edit fields
router.put('/editIntake', function (req, res) {
  var edit = req.body;
  console.log('In Put for edit intake', edit);
  // check if logged in
  if (req.isAuthenticated()) { // --2
    pool.connect(function (conErr, client, done) { // --3 
      if (conErr) {
        console.log('Pool.connect error', conErr);
        res.sendStatus(500);
      } 
      else { //--4     - main query -
        var caseDataQuery = 'INSERT INTO case_data (mcm_number, intake_date, age, gender, last_seen, reported_missing, people_served, city, county, state, school, start_case_type, end_case_type, disposition, close_date, referral_type, case_status) VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT id FROM cities WHERE city_name = $8), (SELECT id FROM counties WHERE county_name = $9), $10, (SELECT id FROM schools WHERE school_name = $11), $12, $13, $14, $15, $16, $17) RETURNING id;' 
        var caseDataValueArray = [newIntake.mcm_number, newIntake.intake_date, newIntake.age, newIntake.gender, newIntake.last_seen, newIntake.reported_missing, newIntake.people_served, newIntake.city_name, newIntake.county_name, newIntake.state, newIntake.school_name, newIntake.start_case_type, newIntake.end_case_type, newIntake.disposition, newIntake.close_date, newIntake.referral_type, newIntake.case_status]
        console.log('caseDataQuery, caseDataValue', caseDataQuery, caseDataValueArray)
        client.query(caseDataQuery, caseDataValueArray, function (queryErr, resultObj) {  // --5
          done(); 
          if (queryErr) { // for id
            console.log('caseData query Error', queryErr)
            res.sendStatus(500); 
          } else { // - vulnerabilities query  --6
              //variables for vulnerabilities
              console.log('id', resultObj.rows[0].id)             
              var tempVArray = []
              var vulnerabilityArray = []
              var vulnerabilityCount = 1
              
              var createVulnQuery = function() {
                for (let i = 0; i < newIntake.case_vulnerabilities.length; i++) {
                  tempVArray.push('('+resultObj.rows[0].id+ ', (Select id FROM vulnerabilities WHERE vulnerability = $'+vulnerabilityCount++ + '))');
                  vulnerabilityArray.push(newIntake.case_vulnerabilities[i].name);
                  }  //end for loop
                } //end create Query function
              
                createVulnQuery(); 
                console.log('tempArray', tempVArray)
                var vulnerabilities$ = tempVArray.join(', ')
                var vulnerabilityInsert = 'INSERT INTO case_vulnerabilities(case_data_id, vulnerabilities_id) VALUES ' 
                var vulnerabilityQuery = vulnerabilityInsert + vulnerabilities$
                console.log('Query, valueArray', vulnerabilityQuery, vulnerabilityArray)
              
                client.query(vulnerabilityQuery, vulnerabilityArray, function (queryErr, resultVulnerability) { // --7
              done();
                if (queryErr) {
                  console.log('Vulnerability query Error', queryErr)
                res.sendStatus(500);
                } else { // start race_ethnicity query  //--8
                  console.log('219 newIntake.race_ethnicity', newIntake.race_ethnicity.name)  
                    //variables for race_enthinicity                 
                    var tempRaceArray = []
                    var raceValueArray = []
                    var raceCount = 1                   
                    var createRaceQuery = function() {
                      console.log('createRaceQuery running', newIntake.race_ethnicity[0].name)
                      for (let j = 0; j < newIntake.race_ethnicity.length; j++) {
                      console.log('for loop running w/ j', j);
                      tempRaceArray.push('('+resultObj.rows[0].id+ ', (Select id FROM race_ethnicity WHERE race_ethnicity = $'+raceCount++ + '))');
                      raceValueArray.push(newIntake.race_ethnicity[j].name);
                       }  
                      console.log('raceValueArray', raceValueArray)
                      } //end function
                    
                      createRaceQuery();
                      console.log('tempArray', tempRaceArray)
                      var raceValue$ = tempRaceArray.join(', ')
                      var raceInsert = 'INSERT INTO case_race_ethnicity (case_data_id, race_ethnicity_id) VALUES ' 
                      var raceQuery = raceInsert + raceValue$
                      console.log('reSqlQuery, valueArray', raceQuery, raceValueArray)
                    
                      client.query(raceQuery, raceValueArray, function (queryErr, raceResult) { // --9
                    done();
                      if (queryErr) {
                        console.log(queryErr)
                        res.sendStatus(500);
                      } else {  // -- 10
                        //start agency Query
                        var tempAgencyArray = []
                        var agencyArray = []
                        var agencyCount = 1
                        
                        var createAgencyQuery = function() {
                          for (let l = 0; l < newIntake.case_lawenforcement_denial.length; l++) {
                            tempAgencyArray.push('('+resultObj.rows[0].id+ ', (Select id FROM law_enforcement WHERE agency = $'+agencyCount++ + '), $' +agencyCount++ +')')
                            agencyArray.push(newIntake.case_lawenforcement_denial[l].name, newIntake.case_lawenforcement_denial[l].denial);
                            }  //end for loop
                          } //end creqte Query function
                        
                          createAgencyQuery(); //2nd query for vulnerabilites
                          console.log('tempAgencyArray', tempAgencyArray)
                          var agencies$ = tempAgencyArray.join(', ')
                          var agencyInsert = 'INSERT INTO case_lawenforcement_denial (case_data_id, law_enforcement_id, jurisdictional_denial) VALUES ' 
                          var agencyQuery = agencyInsert + agencies$
                          console.log('Query, agencyQuery', agencyQuery, agencyArray)
                        
                          client.query(agencyQuery, agencyArray, function (queryErr, resultAgency) { // --11
                        done();
                          if (queryErr) { //if 2nd query fails
                            console.log('Agency query Error', queryErr)
                          res.sendStatus(500);
                          } else {  // --12
                                res.sendStatus(202);
                                } // --12
                              
                        }) // -- 11
                      } // --10                       
              }) // --9
              } // --8
            }) // --7
          } // --6
        }) // --5  
      } // --4
    }) // --3
  } else { // --2
    console.log('not logged in');
    res.send(false);
  } //end authentication else  
}); //end /newIntake  --1

module.exports = router;
