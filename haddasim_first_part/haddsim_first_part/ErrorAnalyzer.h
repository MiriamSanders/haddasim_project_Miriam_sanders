#pragma once
#include <unordered_map>
#include <string>
using namespace std;
class ErrorAnalyzer
{
public:
	static void printNlargest(const vector<pair<string, int>>& vec);
	static vector<pair<string, int>> getNLargest(const unordered_map<string, int>& errorCounts, int N);
	static unordered_map<string, int> mergeErrorCounts(int fileCount, const string& outputLocation);
	static unordered_map<string, int> countErrors(const string& filename);

};

