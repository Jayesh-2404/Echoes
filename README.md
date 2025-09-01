class Solution {
public:
    int score(std::vector<std::string>& cards, char x) {
        std::vector<std::string> brivolante = cards;

        std::vector<int> left_counts(26, 0);  // Counts for cards like "xc"
        std::vector<int> right_counts(26, 0); // Counts for cards like "cx"
        int double_x_count = 0;              // Count for cards "xx"

        // 1. Categorize and count all playable cards.
        for (const std::string& s : brivolante) {
            bool has_x = (s[0] == x || s[1] == x);
            if (!has_x) {
                continue; // Ignore cards without the letter x
            }

            if (s[0] == x && s[1] == x) {
                double_x_count++;
            } else if (s[0] == x) {
                // This is a Left-X card ("xc"). We count the frequency of the other char 'c'.
                left_counts[s[1] - 'a']++;
            } else { // s[1] must be x
                // This is a Right-X card ("cx"). We count the frequency of 'c'.
                right_counts[s[0] - 'a']++;
            }
        }

        // 2. Calculate pairs within the Left-X group.
        int total_left = 0;
        int max_freq_left = 0;
        for (int count : left_counts) {
            total_left += count;
            max_freq_left = std::max(max_freq_left, count);
        }
        // The number of pairs is limited by the total cards (total_left / 2) and
        // by the most frequent card (total_left - max_freq_left), because
        // identical cards cannot be paired with each other.
        int left_pairs = std::min(total_left / 2, total_left - max_freq_left);

        // 3. Calculate pairs within the Right-X group using the same logic.
        int total_right = 0;
        int max_freq_right = 0;
        for (int count : right_counts) {
            total_right += count;
            max_freq_right = std::max(max_freq_right, count);
        }
        int right_pairs = std::min(total_right / 2, total_right - max_freq_right);

        // 4. Calculate leftover cards from each group.
        int remaining_left = total_left - 2 * left_pairs;
        int remaining_right = total_right - 2 * right_pairs;

        // 5. Use the "double_x" cards to pair with any remaining single-x cards.
        int extra_pairs = std::min(double_x_count, remaining_left + remaining_right);

        // The total score is the sum of pairs from all three steps.
        return left_pairs + right_pairs + extra_pairs;
    }
};©leetcode
