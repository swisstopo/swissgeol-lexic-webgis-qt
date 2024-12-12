export const chronoQueries = {
  queryYounger: `
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX time: <http://www.w3.org/2006/time#>
  PREFIX ex: <https://dev-lexic.swissgeol.ch/Chronostratigraphy/>
  
  SELECT DISTINCT ?concept
  WHERE {
    BIND(ex:\${term} AS ?subject)
    {
      # Same level younger concepts
      ?subject time:intervalMeets+ ?concept .
    }
    UNION {
      # Traverse narrower hierarchy
      ?subject time:intervalFinishedBy+ ?narrower .
      ?narrower time:intervalMeets+ ?concept .
    }
    UNION {
      # Traverse broader hierarchy
      ?subject skos:broader+ ?broader .
      ?broader time:intervalMeets+ ?concept .
    }
    UNION {
      # Intermediate objects and narrower concepts
      {
        ?subject time:intervalMeets+ ?intermediateObject .
      }
      UNION {
        ?subject time:intervalFinishedBy+ ?narrower .
        ?narrower time:intervalMeets+ ?intermediateObject .
      }
      UNION {
        ?subject skos:broader+ ?broader .
        ?broader time:intervalMeets+ ?intermediateObject .
      }
      # Add narrower concepts
      ?intermediateObject skos:narrower+ ?concept .
    }
  }`,

  queryOlder: `
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX time: <http://www.w3.org/2006/time#>
  PREFIX ex: <https://dev-lexic.swissgeol.ch/Chronostratigraphy/>
  
  SELECT DISTINCT ?concept
  WHERE {
    BIND(ex:\${term} AS ?subject)
    {
      # Same level older concepts
      ?subject time:intervalMetBy+ ?concept .
    }
    UNION {
      # Traverse narrower hierarchy
      ?subject time:intervalStartedBy+ ?narrower .
      ?narrower time:intervalMetBy+ ?concept .
    }
    UNION {
      # Traverse broader hierarchy
      ?subject skos:broader+ ?broader .
      ?broader time:intervalMetBy+ ?concept .
    }
    UNION {
      # Intermediate objects and narrower concepts
      {
        ?subject time:intervalMetBy+ ?intermediateObject .
      }
      UNION {
        ?subject time:intervalStartedBy+ ?narrower .
        ?narrower time:intervalMetBy+ ?intermediateObject .
      }
      UNION {
        ?subject skos:broader+ ?broader .
        ?broader time:intervalMetBy+ ?intermediateObject .
      }
      # Add narrower concepts
      ?intermediateObject skos:narrower+ ?concept .
    }
    UNION {
      # Intermediate objects and intervalFinishes concepts
      {
        ?subject time:intervalMetBy+ ?intervalFinishes .
      }
      UNION {
        ?subject time:intervalStartedBy+ ?narrower .
        ?narrower time:intervalMetBy+ ?intervalFinishes .
      }
      UNION {
        ?subject skos:broader+ ?broader .
        ?broader time:intervalMetBy+ ?intervalFinishes .
      }
      # Add intervalFinishes concepts
      ?intervalFinishes time:intervalFinishes ?concept .
    }
  }`,

  queryBetween: `
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX time: <http://www.w3.org/2006/time#>
  PREFIX ex: <https://dev-lexic.swissgeol.ch/Chronostratigraphy/>
  
  SELECT DISTINCT ?concept
  WHERE {
    # Define older and younger subjects
    BIND(ex:\${termOlder} AS ?olderSub)
    BIND(ex:\${termYounger} AS ?youngerSub)
  
    {
      # Step 1: Find intersection of younger-than-olderSub and older-than-youngerSub
      {
        # Concepts younger than olderSub
        {
          ?olderSub time:intervalMeets* ?concept .
        } UNION {
          ?olderSub time:intervalMeets* ?younger .
          ?younger skos:narrower* ?concept .
        } UNION {
          ?olderSub time:intervalStarts* ?concept .
        } UNION {
          ?olderSub skos:broader+ ?broaderOld .
          ?broaderOld time:intervalMeets+ ?concept .
        }
      }
      {
        # Concepts older than youngerSub
        {
          ?youngerSub time:intervalMetBy* ?concept .
        } UNION {
          ?youngerSub time:intervalMetBy* ?older .
          ?older skos:narrower* ?concept .
        } UNION {
          ?youngerSub time:intervalFinishes* ?concept .
        } UNION {
          ?youngerSub skos:broader+ ?broaderYoung .
          ?broaderYoung time:intervalMetBy+ ?concept .
        }
      }
    }
    UNION {
      # Step 2: Add skos:narrower concepts derived from the intersection
      {
        # Repeat intersection logic for intermediate objects
        {
          {
            ?olderSub time:intervalMeets* ?intermediateObject .
          } UNION {
            ?olderSub time:intervalMeets* ?younger .
            ?younger skos:narrower* ?intermediateObject .
          } UNION {
            ?olderSub time:intervalStarts* ?intermediateObject .
          } UNION {
            ?olderSub skos:broader+ ?broaderOld .
            ?broaderOld time:intervalMeets+ ?intermediateObject .
          }
        }
        {
          {
            ?youngerSub time:intervalMetBy* ?intermediateObject .
          } UNION {
            ?youngerSub time:intervalMetBy* ?older .
            ?older skos:narrower* ?intermediateObject .
          } UNION {
            ?youngerSub time:intervalFinishes* ?intermediateObject .
          } UNION {
            ?youngerSub skos:broader+ ?broaderYoung .
            ?broaderYoung time:intervalMetBy+ ?intermediateObject .
          }
        }
      }
      # Traverse skos:narrower from intermediate objects
      ?intermediateObject skos:narrower+ ?concept .
    }
  }`
};