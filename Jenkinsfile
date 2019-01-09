pipeline {
  agent {
    node {
      label 'docker-neoload-68'
    }
  }
  environment {
    WORKSPACE = pwd()
    TEST_DURATION = '2m'
    EUX_THREADS = 2
    MAX_VUS_CHECKOUT = 50
  }
  stages {
    stage('Set up infrastructure') {
      agent { label 'master' }
      steps {
        git(branch: 'develop', url: 'https://github.com/paulsbruce/neoload_68.git')
        step([$class: 'DockerComposeBuilder', dockerComposeFile: 'compose-lgs.yml', option: [$class: 'StartAllServices'], useCustomDockerComposeFile: true])
      }
      /*
        steps {
            build 'NLInfrastructure/NLDeploy'
        }
      */
    }
    stage('Pull latest version of Project from Git') {
      steps {
          git(branch: 'develop', url: 'https://github.com/paulsbruce/neoload_68.git')//, credentialsId: 'github-paulsbruce')
      }
    }
    stage('Define Dynamic Scenario') {
      steps {
        // create dynamic infrastructure pointers: docker-lgN is presumed already spun up by NLDeploy job
        writeFile file: "${env.WORKSPACE}/lgs.txt", text: """
        docker-lg1@Docker\
        docker-lg2@Docker
        """.trim()

        // create a dynamic sanity scenario
        writeFile file: "${env.WORKSPACE}/eux-and-apm.yaml", text: """
scenarios:
- name: dynMixedScenarioEUXwAPM
  populations:
  - name: API_just_ushahidi
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: 5
      increment_users: 1
      increment_every: 10s
  - name: popPost
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: 15
      increment_users: 1
      increment_every: 15s
#  - name: dynatracePop
#    constant_load:
#      duration: ${env.TEST_DURATION}
#      users: 1
  - name: popSelenium
    rampup_load:
      duration: ${env.TEST_DURATION}
      min_users: 1
      max_users: ${env.EUX_THREADS}
      increment_users: 1
      increment_every: 20s
      """
      }
    }

    stage('Main pipeline') {
      parallel {
        stage('NeoLoad Test') {
            steps {
                sh "pwd"
                script {
                    dir(env.WORKSPACE) {
                      /*
                      sh "/usr/local/neoload/bin/NeoLoadCmd"+
                        " -project ${env.WORKSPACE}/demo.nlp"+
                        " -launch dynMixedScenarioEUXwAPM"+
                        " -testResultName 'Load Test w/ APM (build ${BUILD_NUMBER})'"+
                        " -description 'Based on demo-mixed.yaml'"+
                        " -NTS http://nts:8080/nts"+
                        " -NTSLogin admin:con+DjJ+R3s9j9d1qKQFGA=="+
                        " -leaseLicense MCwCFFBs4Jbl0o4HiLd/f7CPnzQ/44TZAhR+6PlJPK7XdmYtka+AHWxn0j2QLg==:50:1"+
                        " -report ${env.WORKSPACE}/neoload-report/neoload-report.html,${env.WORKSPACE}/neoload-report/neoload-report.xml"+
                        " -SLAJUnitResults ${env.WORKSPACE}/neoload-report/junit-sla-results.xml"+
                        " -noGUI -nlweb -variables "+
                        "ControllerAPIHostAndPort=10.0.0.10:7400,"+
                        "TargetHostBaseUrl=http://10.0.0.10,"+
                        "SeleniumHubHostAndPort=10.0.0.15:4444,"+
                        "JRE_JAVA=/usr/local/neoload/jre/bin/java"+
                        " -project ${env.WORKSPACE}/demo-mixed.yaml"+
                        " -project ${env.WORKSPACE}/eux-and-apm.yaml"
                      */

                      neoloadRun project: "${env.WORKSPACE}/demo.nlp",
                          scenario: "dynMixedScenarioEUXwAPM",
                          testName: "Load Test w/ APM (build ${BUILD_NUMBER})",
                          testDescription: "Based on demo-mixed.yaml",
                          reportXml: "${env.WORKSPACE}/neoload-report/neoload-report.xml",
                          reportHtml: "${env.WORKSPACE}/neoload-report/neoload-report.html",
                          reportJunit: "${env.WORKSPACE}/neoload-report/junit-sla-results.xml",
                          trendGraphs: ['AvgResponseTime', 'ErrorRate'],
                          autoArchive: 'false', // by default, the plugin runs archiveArtifacts "neoload-report/**"; junit allowEmptyResults: true, testResults: 'neoload-report/junit*.xml'
                          sharedLicense: [
                              server: 'NeoLoad Demo License',
                              duration: 1,
                              vuCount: env.MAX_VUS_CHECKOUT
                          ],
                          commandLineOption: "-nlweb -variables "+ // variables below must be executed all as one line
                                             "ControllerAPIHostAndPort=10.0.0.10:7400,"+
                                             "TargetHostBaseUrl=http://10.0.0.10,"+
                                             "SeleniumHubHostAndPort=10.0.0.15:4444,"+
                                             "JRE_JAVA=/usr/local/neoload/jre/bin/java"+
                                             " -project ${env.WORKSPACE}/demo-mixed.yaml"+ // static file from repo
                                             " -project ${env.WORKSPACE}/eux-and-apm.yaml"+ // dynamic file from above
                                             "" // TODO: remove this and uncomment below when infra is at v6.8
                                             " --override-lg popPost=${env.WORKSPACE}/lgs.txt"+ // dynamic from above
                                             " -L API_just_ushahidi=${env.WORKSPACE}/lgs.txt" // dynamic from above

                      sh "pwd"
                      sh "sleep 30"
                      archiveArtifacts "neoload-report/**"
                      junit allowEmptyResults: true, testResults: 'neoload-report/junit*.xml'
                    }
                }
            }
        }
        stage('While Test Running')
        {
          steps {
            sh """
              echo
              echo --- Dynatrace Dashboard ---
              echo "https://vwv51099.live.dynatrace.com/#dashboard;id=b832b009-8a4d-45fa-8488-33214bf07443;gtf=l_30_MINUTES"
              echo ---
              """
          }
        }
      }
    }
    stage('After Test Exits') {
        steps {
          echo "Test exited without any process errors."
        }
    }
  }
  post {
      always {
          step([$class: 'DockerComposeBuilder', dockerComposeFile: 'compose-lgs.yml', option: [$class: 'StopAllServices'], useCustomDockerComposeFile: true])
          /*
          build 'NLInfrastructure/NLShutdown'
          */
      }
  }
}
