var TALENT_DATA = {
  "grid": {
    "rows": 10,
    "cols": 5
  },
  "pointsPerTier": 5,
  "defaultPoints": 51,
  "classes": {
    "Awesome Class": {
      "pointsCap": 51,
      "trees": [
        {
          "id": "first-tree",
          "name": "First Tree",
          "ico": "icons/my-skill-1.jpg",
          "pointsCap": 51,
          "talents": [
            {
              "id": "one-talent",
              "name": "One Talent",
              "icon": "icons/my-skill-2.jpg",
              "row": 0,
              "col": 0,
              "maxRank": 5,
              "ranksDesc": [
                "Good First Talent!",
                "A Second Rank",
                "Better Third Rank!",
                "THE BEST",
				"!!The better BEST!!"
              ]
            },
            {
              "id": "new-talent",
              "name": "New Talent",
              "icon": "icons/my-skill-1.jpg",
              "row": 1,
              "col": 2,
              "maxRank": 1,
              "ranksDesc": [
                "New Description"
              ]
            }
          ]
        }
      ]
    }
  }
};