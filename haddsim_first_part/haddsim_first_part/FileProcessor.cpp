#include "FileProcessor.h"
#include <string>
#include <fstream>
#include <iostream>
using namespace std;
// class for spliting the file 
int FileProcessor::splitFile(const string& inputFile, const string& outputLocation)
{
	
	int fileCount = 1;
	ifstream inFile(inputFile);
	if (!inFile) {
		cerr << "Error opening file " << inputFile << endl;
		return 0;
	}

	string line;
	int lineCount = 0;
	fstream iofile;

	while (getline(inFile, line)) {
		// when the count gets to 1000 start writing to the next file.
		if (lineCount % 1000 == 0) {
			if (iofile.is_open()) iofile.close();
			string fileName = outputLocation + "/log_segment" + to_string(fileCount) + ".txt";
			iofile.open(fileName, ios::out);
			fileCount++;
		}
		iofile << line << endl;
		lineCount++;
	}
	if (iofile.is_open()) iofile.close();
	inFile.close();

	cout << "File split completed successfully." << endl;
	return fileCount;
}

