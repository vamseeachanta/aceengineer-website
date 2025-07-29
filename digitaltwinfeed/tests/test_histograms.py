from common.histograms import Histogram


def test_Histograms():
    hist = Histogram()
    data_array = [1, 1, 2, 2, 2, 2, 3]
    data_bins = list(range(5))
    histogram_dict = hist.get_histograms_for_array(data_array, data_bins)
    print(histogram_dict)


if __name__ == '__main__':
    test_Histograms()
