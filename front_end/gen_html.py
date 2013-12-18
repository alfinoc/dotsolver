DIM = 6

rad = 1.0 / (4 * (DIM + 1)) * 100.0;
for i in range (1, DIM + 1):
   for j in range (1, DIM + 1):
      x = i / (DIM + 1.0) * 100
      y = j / (DIM + 1.0) * 100
      print "<circle cx=\"{0}%\" cy=\"{1}%\" r=\"{2}%\" id=\"{3}\" />".format(x, y, rad, (i - 1) * DIM + (j - 1))