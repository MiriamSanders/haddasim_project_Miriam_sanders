#include <unordered_map>
#include <vector>
#include <algorithm>
#include <string>
#include <iostream>
#include <fstream>
#include <unordered_map>
#include "ErrorAnalyzer.h"
using namespace std;
// receives a file and returns a unordered map with the amount of each kind of error
unordered_map<string, int> ErrorAnalyzer::countErrors(const string& filename)
{
	ifstream file(filename);
	unordered_map<string, int> errorCounts;
	string line;

	if (!file.is_open()) {
		cerr << "Could not open the file!" << endl;
		return errorCounts;
	}
	
	while (getline(file, line)) {
		// find the location of the error in the line
		size_t errorPos = line.find("Error: ");
		// if the postion was found
		if (errorPos != string::npos) {
			// retrive the error code
			string error = line.substr(errorPos + 7);
			// removing the " from the end
			error.pop_back();
			// adding to the unorderd map
			errorCounts[error]++;
		}
	}
	file.close();
	return errorCounts;
}
// count for every file sepratly and merge to on unorderd map
unordered_map<string, int> ErrorAnalyzer::mergeErrorCounts(int fileCount, const string& outputLocation)
{
	// add the first file
	unordered_map<string, int> merged = countErrors(outputLocation + "/log_segment1.txt");
	// merge the rest of the files
	for (int i = 2; i < fileCount; i++) {
		string fileName = outputLocation + "/log_segment" + to_string(i) + ".txt";
		unordered_map<string, int> temp = countErrors(fileName);
		for (const auto& pair : temp) {
			merged[pair.first] += pair.second;
		}
	}
	return merged;
}
// sort the error map - convert to vector and sort return the N first pairs in the sorted map
vector<pair<string, int>> ErrorAnalyzer::getNLargest(const unordered_map<string, int>& errorCounts, int N=2)
{
	vector<pair<string, int>> sortedErrors(errorCounts.begin(), errorCounts.end());
	sort(sortedErrors.begin(), sortedErrors.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
		return a.second > b.second;
		});
	if (N > sortedErrors.size()) N = sortedErrors.size();
	return vector<pair<string, int>>(sortedErrors.begin(), sortedErrors.begin() + N);
}
// print pairs
void ErrorAnalyzer::printNlargest(const vector<pair<string, int>>& vec)
{
	for (const auto& pair : vec) {
		cout << pair.first << ": " << pair.second << endl;
	}
}
