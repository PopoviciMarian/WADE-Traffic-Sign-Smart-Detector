from flask import Flask, request, jsonify
from SPARQLWrapper import SPARQLWrapper, JSON

app = Flask(__name__)

# Define your SPARQL endpoint
SPARQL_ENDPOINT = "http://34.170.217.42/bigdata/namespace/trafficSign/sparql"  # Replace with your actual SPARQL endpoint

@app.route('/ontology', methods=['GET'])
def get_traffic_sign():
    # Get query parameters
    sign_id = request.args.get('id')
    lang = request.args.get('lang', 'en')  # Default to English if not provided

    if not sign_id:
        return jsonify({"error": "Missing required parameter 'id'"}), 400

    # Define SPARQL query
    query = f"""
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX traffic: <http://example.org/traffic-signs#>

    SELECT DISTINCT ?name ?description ?color ?shape ?id ?superclass
    WHERE {{
      ?sign traffic:name ?name .
      ?sign traffic:description ?description .
      ?sign traffic:color ?color .
      ?sign traffic:shape ?shape .
      ?sign traffic:id ?id .
      OPTIONAL {{ ?sign rdfs:subClassOf ?superclass . }}
      FILTER(str(?id) = "{sign_id}")
      FILTER(LANG(?name) = "{lang}" && LANG(?description) = "{lang}" && LANG(?color) = "{lang}" && LANG(?shape) = "{lang}")
    }}
    LIMIT 1
    """

    # Query SPARQL endpoint
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        if not results["results"]["bindings"]:
            return jsonify({"error": "No results found"}), 404

        # Extract result
        result = results["results"]["bindings"][0]
        response = {
            "name": result["name"]["value"],
            "description": result["description"]["value"],
            "color": result["color"]["value"],
            "shape": result["shape"]["value"],
            "id": result["id"]["value"],
            "type": result["superclass"]["value"].split("#")[-1],
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
