#include <iostream>
#include <fstream>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>
#include "FileProcessor.h"
#include "ErrorAnalyzer.h"

using namespace std;
int main() {
    cout << "Finding errors:" << endl;
    string inputFile = "../textfiles/logs.txt";
    string outputLocation = "../textfiles/segmentedTextFiles";
    cout << "enter number of errors to find" << endl;
    int num=0;
    cin >> num;
    //split file into segments
    int count = FileProcessor::splitFile(inputFile, outputLocation);
    // count errors and then merge them to one unorderd map
    unordered_map<string, int> merged = ErrorAnalyzer::mergeErrorCounts(count, outputLocation);
    // returns the N largest counted errors
    vector<pair<string, int>> Nlargest = ErrorAnalyzer::getNLargest(merged, num);
    ErrorAnalyzer::printNlargest(Nlargest);

    return 0;
}

//run-time complexity: o(n) space complexity o(n) - n being the number of lines in the original file:
// the split file function reads all N lines if the file therefore it is O(n)
// the merge reads all the lines in all the files- which is a total of n lines - insertation into the unordered map is o(1) there for it runs  O(n).
// the getNlargest get N largest errors it runs mlog(m) times (m- number of errors) 
// the print N largest prints K errors - it runs o(k) 
// therefore the total runtime is o(n) +o(n) + mlog(m) + o(k) =o(n)
// because k is smaller then n. also m is smaller the n therefore the avarge case will be o(n) if m=n then the run time will be nlog(n)- worst case.
//space compexity maximum o(n) because we will save a maximum of n types of errors in the unorderd map.